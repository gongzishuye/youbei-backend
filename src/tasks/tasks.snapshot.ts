import { Injectable } from '@nestjs/common';
import {IFieldValueMap, IRecord, Vika} from "@vikadata/vika";
import { Cron } from '@nestjs/schedule';
import { tasksConfig, TOKEN } from './tasks.config';

export interface VikaRecord extends IRecord {
  fields: IFieldValueMap;
}

type VikaDatasheet = ReturnType<typeof Vika.prototype.datasheet>;

@Injectable()
export class SnapshotService {

  vikaConnectorBuy: VikaDatasheet | null = null;
  vikaConnectorSell: VikaDatasheet | null = null;
  vikaConnectorIncome: VikaDatasheet | null = null;
  vikaConnectorExpense: VikaDatasheet | null = null;
  vikaConnectorDebt: VikaDatasheet | null = null;
  vikaConnectorMultiPool: VikaDatasheet | null = null;
  vikaConnectorAssetSnapshot: VikaDatasheet | null = null;



  constructor() {
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

  async vika_query (vikaConnector: VikaDatasheet | null, query: number) {
    if (!vikaConnector) {
        throw new Error("Vika connector not found");
    }
    // { filterByFormula: `find("${query}", {日期}) > 0`}
    const allRecordsIter = await vikaConnector.records.query({ filterByFormula: `${query} < {日期}`});
    console.log(query, allRecordsIter);
    return allRecordsIter?.data?.records;
  }

  initVikaConnector(datasheets: Record<string, string>) {
    console.log('datasheets', datasheets);
    this.vikaConnectorBuy = this.vika_connector({
      datasheetId: datasheets.buy
    });
    this.vikaConnectorSell = this.vika_connector({
      datasheetId: datasheets.sell
    });
    this.vikaConnectorIncome = this.vika_connector({
      datasheetId: datasheets.income
    });
    this.vikaConnectorExpense = this.vika_connector({  
      datasheetId: datasheets.expense
    });
    this.vikaConnectorDebt = this.vika_connector({
      datasheetId: datasheets.debt
    });
    this.vikaConnectorMultiPool = this.vika_connector({
      datasheetId: datasheets.multipool
    });
    this.vikaConnectorAssetSnapshot = this.vika_connector({
      datasheetId: datasheets.assetsnapshot
    });
  }

  @Cron('0 10 * * * *')
  async run() {
    for(const item of Object.entries(tasksConfig)) {
      console.log(`running ${item}`);
      const [name, config] = item;
      const datasheets = config.datasheets;

      await this.readSnapshot(datasheets);
    }
  }

  async readSnapshot(datasheets: Record<string, string>) {
    this.initVikaConnector(datasheets);
    let records = await this.vika_queryAll(this.vikaConnectorSell);
    let snapPNL = 0;
    for(const record of records) {
      snapPNL += record.fields['锁定盈亏的人民币价值'] as number;
    }

    let snapUPNL = 0;
    let snapInnerDebt = 0;
    records = await this.vika_queryAll(this.vikaConnectorBuy);
    for(const record of records) {
      snapUPNL += record.fields['持仓盈亏'] as number;
      snapInnerDebt += record.fields['当前负债额'] as number;
    }

    let snapExpense = 0;
    records = await this.vika_queryAll(this.vikaConnectorExpense);
    for(const record of records) {
      snapExpense += record.fields['支出货币的人民币价值'] as number;
    }

    let snapCash = 0;
    let snapPosition = 0
    records = await this.vika_queryAll(this.vikaConnectorMultiPool);
    for(const record of records) {
      console.log(record);
      const title = record.fields['标题'] as string;
      const cash = record.fields['人民币总价值'] as number;
      if(cash === undefined) continue;

      if(title === '持仓余额') {
        snapPosition += cash;
      } else {
        snapCash += cash;
      }
    }

    let snapOuterDebt = 0;
    records = await this.vika_queryAll(this.vikaConnectorDebt);
    for(const record of records) {
      snapOuterDebt += record.fields['剩余负债本金'] as number;
    }
    let snapDebt = snapInnerDebt + snapOuterDebt;
    
    let snapTotalAssets = snapCash + snapPosition;    
    let snapTotalLiabilities = snapDebt;
    let snapNetworth = snapTotalAssets + snapTotalLiabilities;
    
    console.log(`snapPNL: ${snapPNL}`);
    console.log(`snapUPNL: ${snapUPNL}`);
    console.log(`snapExpense: ${snapExpense}`);
    console.log(`snapCash: ${snapCash}`);
    console.log(`snapPosition: ${snapPosition}`);
    console.log(`snapOuterDebt: ${snapOuterDebt}`);
    console.log(`snapDebt: ${snapDebt}`);
    console.log(`snapTotalAssets: ${snapTotalAssets}`);
    console.log(`snapTotalLiabilities: ${snapTotalLiabilities}`);
    console.log(`snapNetworth: ${snapNetworth}`);
    console.log(new Date().toISOString().split('T')[0]);
    
    await this.updateVikaFruit(
      snapPNL,
      snapUPNL,
      snapExpense,
      snapCash,
      snapPosition,
      snapTotalAssets,
      snapTotalLiabilities, 
      snapNetworth,
    );
    return {
      snapPNL,
      snapUPNL,
      snapExpense,
      snapCash,
      snapPosition,
    }
  }

  async updateVikaFruit(
    snapPNL: number,
    snapUPNL: number,
    snapExpense: number,
    snapCash: number,
    snapPosition: number,
    snapTotalAssets: number,
    snapTotalLiabilities: number,
    snapNetworth: number,
  ) { 
      // 创建data变量，判断当前时间是不是0点
      const data = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit', 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
      }).replace(/\//g, '-');
      const dateWithoutHour = data.split(' ')[0];
      const fieldDate = new Date();

      console.log(dateWithoutHour, data);
      if(fieldDate.getHours() === 0) {
        await this.vikaConnectorAssetSnapshot.records.create([
          {
            fields: {
            '日期': fieldDate.getTime(), // 格式：2025-02-04
            '总资产': snapTotalAssets,
            '净资产': snapNetworth,
            '总负债': snapTotalLiabilities,
            '投资损益（锁定盈亏）': snapPNL,
            '浮动盈亏': snapUPNL,
            '支出': snapExpense,
            '现金余额': snapCash,
            '持仓余额': snapPosition,
            '最后更新日期': data
          }
        }
      ]);
    } else {
       fieldDate.setHours(0, 0, 0, 0);
       const records = await this.vika_query(this.vikaConnectorAssetSnapshot, fieldDate.getTime());
       if(records.length > 0) {
        const item = {
          recordId: records[0].recordId,
          fields: {
            '总资产': snapTotalAssets,
            '净资产': snapNetworth,
            '总负债': snapTotalLiabilities,
            '投资损益（锁定盈亏）': snapPNL,
            '浮动盈亏': snapUPNL,
            '支出': snapExpense,
            '现金余额': snapCash,
            '持仓余额': snapPosition,
            '最后更新日期': data
          }
        }
        await this.vikaConnectorAssetSnapshot.records.update([item]);
       } else {
        console.log('no records');
        await this.vikaConnectorAssetSnapshot.records.create([
          {
            fields: {
              '日期': new Date().getTime(), // 格式：2025-02-04
              '总资产': snapTotalAssets,
              '净资产': snapNetworth,
              '总负债': snapTotalLiabilities,
              '投资损益（锁定盈亏）': snapPNL,
              '浮动盈亏': snapUPNL,
              '支出': snapExpense,
              '现金余额': snapCash,
              '持仓余额': snapPosition,
              '最后更新日期': data
            }
          }
        ]);
      }
    }
  }
}
