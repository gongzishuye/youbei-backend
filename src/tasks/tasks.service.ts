import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {IFieldValueMap, IRecord, Vika} from "@vikadata/vika";
import { Cron } from '@nestjs/schedule';
import { tasksConfig, TOKEN } from './tasks.config';

export interface VikaRecord extends IRecord {
  fields: IFieldValueMap;
}

type VikaDatasheet = ReturnType<typeof Vika.prototype.datasheet>;

export type Records = Record<string, {
  美元: number;
  人民币: number;
  欧元: number;
  港币: number;
  泰铢: number;
  USDT: number;
  total: number;
}>;

@Injectable()
export class TasksService {
  exchangeRateSheetId = 'dstNlVoLWMJeDez8rS';
  vikaConnectorExchangeRate: VikaDatasheet | null = null;

  currencyIds = {
    usd: 'recy4XL7yFUeE',
    cny: 'recKjnEtl3Dzh',
    eur: 'rec9CVYvEIOCf',
    hkd: 'recm6DbBTGRTi',
    thb: 'rece6wIpLJYnf',
    usdt: 'recPTbzZU50zS',
  }

  constructor() {
    this.vikaConnectorExchangeRate = this.vika_connector({
      datasheetId: this.exchangeRateSheetId
    });
  }

  vika_connector(data: {
    datasheetId: string;
  }) {
      const vika = new Vika({token: TOKEN, fieldKey: "name"});
      const datasheet = vika.datasheet(data.datasheetId);
      return datasheet;
  }

  async vika_queryAll (vikaConnector: VikaDatasheet | null) {
    if (!vikaConnector) {
        throw new Error("Vika connector not found");
    }
    const allRecordsIter = vikaConnector.records.queryAll();
    let records: VikaRecord[] = [];
    for await (const eachPageRecords of allRecordsIter) {
        records = records.concat(eachPageRecords as VikaRecord[]);
    }
    return records;
  }

  @Cron('0 0 * * * *')
  async run() {
    for(const item of Object.entries(tasksConfig)) {
      console.log(`running ${item}`);
      const [name, config] = item;
      const datasheets = config.datasheets;
      await this.readVikaMultiPools(datasheets);
    }
  }

  async readVikaMultiPools(datasheets: Record<string, string>) {
    const vikaConnectorBuy = this.vika_connector({
      datasheetId: datasheets['buy']
    });
    let records = await this.vika_queryAll(vikaConnectorBuy);
    const positionResult: Records = {};
    const cashResult: Records = {};
    for(const pool of ['种菜', '种果树', '狩猎', '钓鱼', '生态位', '捡馅饼']) {
      positionResult[pool] = {
        美元: 0,
        人民币: 0,
        欧元: 0,
        港币: 0,
        泰铢: 0,
        USDT: 0,
        total: 0,
      }
      cashResult[pool] = {
        美元: 0,
        人民币: 0,
        欧元: 0,
        港币: 0,
        泰铢: 0,
        USDT: 0,
        total: 0,
      }
    }
    for (const record of records) {
      const pool = record.fields['所属投资池'] as string;
      const currency = record.fields['标的定价币种'][0] as string;
      const amount = record.fields['原始持仓金额'] as number;
      const totalCNY = record.fields['持仓金额'] as number;
      if (pool === '种菜') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      } else if (pool === '种果树') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      } else if (pool === '狩猎') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      } else if (pool === '钓鱼') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      } else if (pool === '生态位') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      } else if (pool === '捡馅饼') {
        this.packMultiPoolPosition(positionResult, currency, pool, amount, totalCNY);
      }
    }
    console.log(positionResult);
    // if(0 < 1) process.exit(0);

    const vikaConnectorBalance = this.vika_connector({
      datasheetId: datasheets['balance']
    });
    await this.packMultiPoolCash(cashResult, vikaConnectorBalance);
    console.log(cashResult);
    
    const vikaConnectorMultiPool = this.vika_connector({
      datasheetId: datasheets['multipool']
    });
    const multiPoolRecords = await this.vika_queryAll(vikaConnectorMultiPool);
    const multiPoolResult: IRecord[] = [];
    const exchangeRateMap = await this.getExchangeRate();
    for (const record of multiPoolRecords) {
      const pool = record.fields['所属投资池'] as string;
      const recordId = record['recordId'];
      const title = record.fields['标题'] as string; // 持仓余额 and 现金余额
      console.log(title, pool, recordId);

      const result = title === '持仓余额' ? positionResult[pool] : cashResult[pool];
      console.log(result);
      multiPoolResult.push({
        recordId: recordId,
        fields: {
          标题: title,
          人民币: result?.人民币,
          美元: result?.美元,
          欧元: result?.欧元,
          港币: result?.港币,
          泰铢: result?.泰铢,
          USDT: result?.USDT,
          人民币总价值: result?.total,
          欧元汇率: exchangeRateMap.get('欧元')!,
          美元汇率: exchangeRateMap.get('美元')!,
          港币汇率: exchangeRateMap.get('港币')!,
          泰铢汇率: exchangeRateMap.get('泰铢')!,
          USDT汇率: exchangeRateMap.get('USDT')!,
        }
      });
    }
    await this.updateVikaMultiPool(multiPoolResult, vikaConnectorMultiPool);

    return records;
  }

  /**
   * 
   * @param strategy 
   * @param currency 
   * @param pool 
   * @param amount 
   * @param totalCNY 
   * @returns 
   */
  packMultiPoolPosition(
    strategy: Record<string, {
      美元: number;
      人民币: number;
      欧元: number;
      港币: number;
      泰铢: number;
      total: number;
    }>, currency: string, pool: string, amount: number, totalCNY: number) {
      if(strategy[pool] === undefined) {
        strategy[pool] = {
          美元: 0,
          人民币: 0,
          欧元: 0,
          港币: 0,
          泰铢: 0,
          total: 0,
        }
      }
      if(amount === undefined || totalCNY === undefined) return;

      if(currency === 'usd' || currency === this.currencyIds.usd) {
        strategy[pool]['美元'] += amount;
      } else if(currency === 'cny' || currency === this.currencyIds.cny) {
        strategy[pool]['人民币'] += amount;
      } else if(currency === 'eur' || currency === this.currencyIds.eur) {
        strategy[pool]['欧元'] += amount;
      } else if(currency === 'hkd' || currency === this.currencyIds.hkd) {
        strategy[pool]['港币'] += amount;
      } else if(currency === 'thb' || currency === this.currencyIds.thb) {
        strategy[pool]['泰铢'] += amount;
      } else if(currency === 'usdt' || currency === this.currencyIds.usdt) {
        strategy[pool]['USDT'] += amount;
      }
      strategy[pool]['total'] += totalCNY;
  }

  /**
   * 
   * @param cashResult 
   * @param vikaConnector 
   * @param pool 
   */
  async packMultiPoolCash(
    cashResult: Record<string, {
      美元: number;
      人民币: number;
      欧元: number;
      港币: number;
      泰铢: number;
      total: number;
    }>,
    vikaConnector: VikaDatasheet | null
  ) {
    const exchangeRateMap = await this.getExchangeRate();
    const records = await this.vika_queryAll(vikaConnector);
    for (const record of records) {
        // 判断record.fields['欧元余额']如果是数组，则取第一个
        const eur = Array.isArray(record.fields['欧元余额']) ? record.fields['欧元余额'][0] : record.fields['欧元余额'];
        const cny = Array.isArray(record.fields['人民币余额']) ? record.fields['人民币余额'][0] : record.fields['人民币余额'];
        const usd = Array.isArray(record.fields['美元余额']) ? record.fields['美元余额'][0] : record.fields['美元余额'];
        const hkd = Array.isArray(record.fields['港币余额']) ? record.fields['港币余额'][0] : record.fields['港币余额'];
        const thb = Array.isArray(record.fields['泰铢余额']) ? record.fields['泰铢余额'][0] : record.fields['泰铢余额']; 
        const usdt = Array.isArray(record.fields['USDT余额']) ? record.fields['USDT余额'][0] : record.fields['USDT余额'];

        const pool = record.fields['策略'] as string;
        console.log(eur, cny, usd, hkd, thb, usdt, pool);
         
        if(eur) {
          this.packMultiPoolPosition(cashResult, 'eur', pool, eur, 
            exchangeRateMap.get('欧元')! * eur
          );
        }
        if(cny) {
          this.packMultiPoolPosition(cashResult, 'cny', pool, cny, 
            exchangeRateMap.get('人民币')! * cny
          );
        }
        if(usd) {
          this.packMultiPoolPosition(cashResult, 'usd', pool, usd, 
            exchangeRateMap.get('美元')! * usd
          );
        }
        if(hkd) {
          this.packMultiPoolPosition(cashResult, 'hkd', pool, hkd, 
            exchangeRateMap.get('港币')! * hkd
          );
        }
        if(thb) {
          this.packMultiPoolPosition(cashResult, 'thb', pool, thb,
            exchangeRateMap.get('泰铢')! * thb
          );
        }
        if(usdt) {
          this.packMultiPoolPosition(cashResult, 'usdt', pool, usdt, 
            exchangeRateMap.get('USDT')! * usdt
          );
        }      
      }
      console.log('here we come');
    }

  async getExchangeRate() {
    const exchangeRateRecords = await this.vika_queryAll(this.vikaConnectorExchangeRate);
    const exchangeRateMap = new Map<string, number>();
    for (const record of exchangeRateRecords) {
      const currency = record.fields['标题'] as string;
      const rate = record.fields['汇率（对人民币）'] as number;
      exchangeRateMap.set(currency, rate);
    }
    return exchangeRateMap;
  }

  async updateVikaMultiPool(records: IRecord[], vikaConnector: VikaDatasheet | null) {
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      await vikaConnector!.records.update(records.slice(i, i + batchSize));
    }
  }
}
