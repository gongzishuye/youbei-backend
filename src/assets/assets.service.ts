import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateBuysDto } from './dto/create-buys.dto';
import { UpdateSellsDto } from './dto/create-sells.dto';
import { UpdateIncomesDto } from './dto/create-incomes.dto';
import { UpdateExpensesDto } from './dto/create-expenses.dto';
import { UpdateRepaysDto } from './dto/create-repay.dto';
import { UpdateBorrowsDto } from './dto/create-borrow.dto';
import { Assets } from './entities/asset.entity';
import { AssetsCurdService } from './assets.curd';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Statistics } from './entities/statistics.entity';
import { Like } from 'typeorm';
import { CreateBuysDto } from './dto/create-buys.dto';
import { CreateSellsDto } from './dto/create-sells.dto';
import { CreateIncomesDto } from './dto/create-incomes.dto';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';
import { StrategyType } from './assets.constants';
import { Pnl } from './entities/pnl.entity';
import { Currencies } from './entities/currencies.entity';
import { subDays, setMonth, setDate, startOfQuarter } from 'date-fns';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { CreateRepayDto } from './dto/create-repay.dto';
import { AssetsSnapshot } from './entities/asset_snapshot.entity';
import { Buys } from './entities/buys.entity';
import { Sells } from './entities/sells.entity';
import { ContentCurdService } from 'src/contents/content.curd';
import { Summary } from 'src/contents/entities/summary.entity';
@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  constructor(
    @InjectRepository(Assets)
    private assetsRepository: Repository<Assets>,
    private assetsCurdService: AssetsCurdService,
    @InjectRepository(AssetsStatistics)
    private assetsStatisticsRepository: Repository<AssetsStatistics>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Pnl)
    private pnlRepository: Repository<Pnl>,
    @InjectRepository(AssetsSnapshot)
    private assetsSnapshotRepository: Repository<AssetsSnapshot>
  ) {}

  async getCurrencies() {
    return this.assetsCurdService.findCurrencies();
  }

  async updateLocalCurrencies() {
    const currencies = await this.assetsCurdService.findCurrencies();
    for(const currency of currencies) {
      const key = currency.id.toString();
      this.cacheManager.set(`currency_${key}`, JSON.stringify(currency));
    }
  }

  async createAssetsSnapshot() {
    const assets = await this.assetsRepository.find();
    for(const asset of assets) {
      const key = `asset_${asset.id}_old`;
      this.cacheManager.set(key, JSON.stringify(asset));
    }

    const snapshotTime = new Date();
    snapshotTime.setHours(0, 0, 0, 0);
    const assetsSnapshots = assets.map(asset => {
      const assetSnapshot = this.assetsSnapshotRepository.create(asset);
      assetSnapshot.snapshotTime = snapshotTime;
      assetSnapshot.assetId = asset.id;
      assetSnapshot.id = null;
      return assetSnapshot;
    });
    const batchSize = 20;
    for(let i = 0; i < assetsSnapshots.length; i += batchSize) {
      const batch = assetsSnapshots.slice(i, i + batchSize);
      await this.assetsSnapshotRepository.save(batch);
      this.logger.log(`create assets snapshot ${i} - ${i + batchSize}`);
    }
  }

  async updateLocolAssets(isOld: boolean) {
    this.logger.log(`update local assets ${isOld ? 'old' : 'new'}`);
    const assets = await this.assetsRepository.find();
    for(const asset of assets) {
      const key = isOld ? `asset_${asset.id}_old` : `asset_${asset.id.toString()}`;
      this.cacheManager.set(key, JSON.stringify(asset));
    }
  }

  async update(id: number, updateAssetDto: UpdateAssetDto): Promise<Assets> {
    const asset = await this.assetsRepository.findOneBy({ id });
    if (!asset) {
      throw new Error('Asset not found');
    }
    Object.assign(asset, updateAssetDto);
    return this.assetsRepository.save(asset);
  }

  async remove(id: number): Promise<void> {
    await this.assetsRepository.delete(id);
  }

  getEmptyStatisticsDto(userId: number) {
    const statisticsDto = {
      userId: userId,
      isCash: true,
      fishingCashUsd: 0,
      fishingCashHkd: 0,
      fishingCashEur: 0,
      fishingCashCny: 0,
      fishingCashThb: 0,
      fishingCashUsdt: 0,
      fruitCashUsd: 0,
      fruitCashHkd: 0,
      fruitCashEur: 0,
      fruitCashCny: 0,
      fruitCashThb: 0,
      fruitCashUsdt: 0,
      vegetableCashUsd: 0,
      vegetableCashHkd: 0,
      vegetableCashEur: 0,
      vegetableCashCny: 0,
      vegetableCashThb: 0,
      vegetableCashUsdt: 0,
      huntingCashUsd: 0,
      huntingCashHkd: 0,
      huntingCashEur: 0,
      huntingCashCny: 0,
      huntingCashThb: 0,
      huntingCashUsdt: 0,
      ecologyCashUsd: 0,
      ecologyCashHkd: 0,
      ecologyCashEur: 0,
      ecologyCashCny: 0,
      ecologyCashThb: 0,
      ecologyCashUsdt: 0,
      pieCashUsd: 0,
      pieCashHkd: 0,
      pieCashEur: 0,
      pieCashCny: 0,
      pieCashThb: 0,
      pieCashUsdt: 0,
      totalCny: 0
    };
    return statisticsDto;
  }

  // Invoked when buys/sells/incomes/expenses
  async statistics(userId: number) {
    const cashPools = await this.assetsCurdService.findCashpoolByUserIdGroupByCurrencyId(userId);
    this.logger.log(cashPools);
    
    const currencies = await this.assetsCurdService.findCurrencies();
    const currencyMap = new Map();
    for(const currency of currencies) {
      currencyMap.set(currency.id, currency);
    }

    const { cashStatistics: cashStatisticsEntity, 
      positionStatistics: positionStatisticsEntity } = 
      await this.assetsCurdService.findStatisticsOneByUserid(userId);

    const cashStatisticsDto = this.getEmptyStatisticsDto(userId);
    let cashTotal = 0;
    cashStatisticsDto.isCash = true;
    for(const cashPool of cashPools) {
      if(cashPool.currencyId === 2) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.vegetableCashUsd += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashUsd += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
        cashStatisticsDto.pieCashUsd += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;
        cashStatisticsDto.fishingCashUsd += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashUsd += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashUsd += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
      } else if(cashPool.currencyId === 3) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.vegetableCashHkd += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashHkd += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
        cashStatisticsDto.pieCashHkd += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;
        cashStatisticsDto.fishingCashHkd += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashHkd += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashHkd += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
      } else if(cashPool.currencyId === 5) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.vegetableCashEur += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashEur += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
        cashStatisticsDto.pieCashEur += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;
        cashStatisticsDto.fishingCashEur += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashEur += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashEur += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
      } else if(cashPool.currencyId === 1) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.vegetableCashCny += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashCny += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
        cashStatisticsDto.pieCashCny += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;
        cashStatisticsDto.fishingCashCny += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashCny += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashCny += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
      } else if(cashPool.currencyId === 4) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.vegetableCashThb += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashThb += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
        cashStatisticsDto.pieCashThb += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;  
        cashStatisticsDto.fishingCashThb += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashThb += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashThb += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
      } else if(cashPool.currencyId === 6) {
        const currency = currencyMap.get(cashPool.currencyId);
        const exchangeRate = currency.exchangeRate;
        cashStatisticsDto.fishingCashUsdt += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * exchangeRate;
        cashStatisticsDto.fruitCashUsdt += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * exchangeRate;
        cashStatisticsDto.ecologyCashUsdt += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * exchangeRate;
        cashStatisticsDto.pieCashUsdt += cashPool.pieCash;
        cashTotal += cashPool.pieCash * exchangeRate;
        cashStatisticsDto.vegetableCashUsdt += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * exchangeRate;
        cashStatisticsDto.huntingCashUsdt += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * exchangeRate;
      }
    }
    cashStatisticsDto.totalCny = cashTotal;
    const cashStatistics = this.statisticsRepository.create(cashStatisticsDto);
    this.logger.log(cashStatisticsDto);
    if(cashStatisticsEntity.length > 0) cashStatistics.id = cashStatisticsEntity[0].id;
    await this.statisticsRepository.save(cashStatistics);

    const positionsStatisticsDto = this.getEmptyStatisticsDto(userId);
    positionsStatisticsDto.isCash = false;
    const positions = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userId);
    this.logger.log(positions);
    let positionsTotal = 0;
    let upnl = 0;
    for(const position of positions) {
      this.logger.log(position);
      if(position.strategy === 3) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fishingCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        }
      } else if(position.strategy === 2) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.fruitCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        }
      } else if(position.strategy === 1) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.vegetableCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        }
      } else if(position.strategy === 5) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.huntingCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        }
      } else if(position.strategy === 6) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.ecologyCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
          upnl += position.amount * (price - position.price);
        }
      } else if(position.strategy === 4) {
        const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
        if(position.currencyId === 1) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashCny += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        } else if(position.currencyId === 2) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashUsd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        } else if(position.currencyId === 3) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashHkd += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;  
        } else if(position.currencyId === 4) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashThb += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        } else if(position.currencyId === 5) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashEur += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        } else if(position.currencyId === 6) {
          const price = asset.price;
          const value = position.amount * price;
          positionsStatisticsDto.pieCashUsdt += value;
          positionsTotal += value * currencyMap.get(position.currencyId).exchangeRate;
        }
      }
    }
    positionsStatisticsDto.totalCny = positionsTotal;
    const positionsStatistics = this.statisticsRepository.create(positionsStatisticsDto);
    if(positionStatisticsEntity.length > 0) positionsStatistics.id = positionStatisticsEntity[0].id;
    await this.statisticsRepository.save(positionsStatistics);
    return {
      cashTotal,
      positionsTotal,
      upnl
    }
  }

  async assetsStatistics(userId: number, cashTotal: number, positionsTotal: number, upnl: number) {
    const assetsStatisticsDto = {
      userId: userId,
      totalAssets: cashTotal + positionsTotal,
      networth: 0,
      totalLiabilities: 0,
      pnl: 0,
      upnl,
      income: 0,
      expense: 0,
      cash: cashTotal,
      positions: positionsTotal,
    }
    const borrows = await this.assetsCurdService.findBorrowSumByUserId(userId);
    const currencies = await this.assetsCurdService.findCurrencies();
    const currencyMap = new Map(currencies.map(currency => [currency.id, currency]));
    let totalLiabilities = 0;
    for(const borrow of borrows) {
      totalLiabilities += borrow.totalAmount * currencyMap.get(borrow.currencyId).exchangeRate;
    }
    assetsStatisticsDto.totalLiabilities = totalLiabilities;
    assetsStatisticsDto.networth = assetsStatisticsDto.totalAssets - assetsStatisticsDto.totalLiabilities;
    // pnl
    const sells = await this.assetsCurdService.findSellsSumPNLByUserId(userId);
    for(const sell of sells) {
      assetsStatisticsDto.pnl += sell.totalPNL * currencyMap.get(sell.currencyId).exchangeRate;
    }
    
    // expense
    const expenses = await this.assetsCurdService.findExpensesGroupByCurrencyIdByUserId(userId);
    let expenseTotal = 0;
    for(const expense of expenses) {
      expenseTotal += expense.totalAmount * currencyMap.get(expense.currencyId).exchangeRate;
    }
    assetsStatisticsDto.expense = expenseTotal;
    // income
    const incomes = await this.assetsCurdService.findIncomesGroupByCurrencyIdByUserId(userId);
    let incomeTotal = 0;
    for(const income of incomes) {
      incomeTotal += income.totalAmount * currencyMap.get(income.currencyId).exchangeRate;
    }
    assetsStatisticsDto.income = incomeTotal;

    const assetsStatistics = await this.assetsCurdService.findLastestAssetsStatisticsByUserId(userId);
    const newAssetsStatistics = this.assetsStatisticsRepository.create(assetsStatisticsDto);
    if(assetsStatistics.length > 0) {
      newAssetsStatistics.id = assetsStatistics[0].id;
    }
    this.logger.log('updating assets statistics');
    this.logger.log(newAssetsStatistics);
    await this.assetsStatisticsRepository.save(newAssetsStatistics);
  }

  // update all statistics at the same time
  async updateStatistics(userId: number) {
    try {
      const {
        cashTotal, positionsTotal, upnl
      } = await this.statistics(userId);
      await this.assetsStatistics(userId, cashTotal, positionsTotal, upnl);
    } catch(error) {
      this.logger.error(error);
    }
  }

  async searchAssets(query: string, page: number) {
    console.log(query, page);
    if(!query) {
      return this.assetsRepository.find({ skip: (page - 1) * 10, order: { id: 'DESC' }, take: 10 });
    }
    // 根据字段name 或者 code 模糊查询
    const assets = await this.assetsRepository.find({ 
      where: [
        { name: Like(`%${query}%`) },
        { code: Like(`%${query}%`) }
      ],
      skip: (page - 1) * 10,
      take: 10,
    });

    return assets;
  }

  async countBuys(userid: number, assetid: number) {
    const buysEntity = await this.assetsCurdService.findAssetsById(assetid);
    if(!buysEntity) throw new HttpException('assetid不存在', HttpStatus.BAD_REQUEST);

    const count = await this.assetsCurdService.findBuysCountByUserIdAndAssetId(userid, assetid);
    return {
      count: count + 1
    }
  }

  async searchBuys(userid: number, query: string, page: number) {
    const buys = await this.assetsCurdService.findBuysByUseridQuery(userid, query, page);
    return buys;
  }

  async searchBorrows(userid: number, query: string, page: number) {
    const borrows = await this.assetsCurdService.findBorrowsByUseridQuery(userid, query, page);
    return borrows;
  }

  async getKline(userid: number) {
    const assets = await this.assetsCurdService.findAssetsStatisticsByUserid(userid);
    const lines = assets.map(asset => {
      const date = new Date(asset.createdAt);
      date.setHours(0, 0, 0, 0);
      const point = {
        date,
        value: asset.totalAssets
      }
      return point;
    });
    this.logger.log(lines);

    // 如果lines长度大于50，则均匀抽取50个点
    let newLines = [];
    if(lines.length > 50) {
      for(let i = 0; i < 50; i++) {
        newLines.push(lines[Math.floor(i * lines.length / 50)]);
      }
    } else {
      const lastDate = lines[0].date;
      this.logger.log(lastDate);
      // lastDate 是string类型，变成date类型
      const lastDateDate = new Date(lastDate);
      const reverseLines = [];
      // 补齐50个点，在前面插入，插入的点date是前一个点date的前一天，value是0
      for(let i = 1; i < (50 - lines.length) + 1; i++) {
        reverseLines.push({
          date: new Date(lastDateDate.getTime() - 24 * 60 * 60 * 1000 * i),
          value: 0
        });
      }
      newLines = reverseLines.reverse();
      newLines.push(...(lines.reverse()));
    }
    this.logger.log(newLines);
    // 从newLines中均匀抽取5个点，第一个和最后一个点分别是头尾，其余三个点均匀分布
    const coordinates = [];
    coordinates.push(newLines[0].date);
    for(let i = 1; i < 4; i++) {
      const index = Math.floor(i * (newLines.length - 2) / 4);
      coordinates.push(newLines[index].date);
    }
    coordinates.push(
      newLines[newLines.length - 1].date
    );
    this.logger.log(coordinates);
    return {
      lines: newLines,
      coordinates
    };
  }
  
  // 
  async createBuys(cerateBuysDto: CreateBuysDto) {
    const buysEntity = await this.assetsCurdService.findAssetsById(cerateBuysDto.assetId);
    if(!buysEntity) throw new HttpException('assetid不存在', HttpStatus.BAD_REQUEST);

    const buys = await this.assetsCurdService.createBuys(cerateBuysDto);
    this.updateStatistics(buys.userId);
    return {
      buysId: buys.id,
    }
  }

  async createSells(createSellsDto: CreateSellsDto) {
    const sellsEntity = await this.assetsCurdService.createSells(createSellsDto);
    this.updateStatistics(createSellsDto.userId);
    return {
      sellsId: sellsEntity.id,
    }
  }

  async createIncomes(createIncomesDto: CreateIncomesDto) {
    const incomesEntity = await this.assetsCurdService.createIncomes(createIncomesDto);
    this.updateStatistics(createIncomesDto.userId);
    return {
      incomesId: incomesEntity.id,
    }
  }

  async createExpenses(createExpensesDto: CreateExpensesDto) {
    const expensesEntity = await this.assetsCurdService.createExpenses(createExpensesDto);
    this.updateStatistics(createExpensesDto.userId);
    return {
      expensesId: expensesEntity.id,
    }
  }

  async calculateCNY(statistics: Statistics[]) {
    if(statistics.length === 0) {
      return [0, 0, 0, 0, 0, 0];
    }
    const currencies = await this.assetsCurdService.findCurrencies();
    const currencyMap = new Map(currencies.map(currency => [currency.id, currency]));
    const amounts = [
      statistics[0].vegetableCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].vegetableCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].vegetableCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].vegetableCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].vegetableCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].vegetableCashUsdt * currencyMap.get(6).exchangeRate,
      statistics[0].fruitCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].fruitCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].fruitCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].fruitCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].fruitCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].fruitCashUsdt * currencyMap.get(6).exchangeRate,
      statistics[0].fishingCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].fishingCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].fishingCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].fishingCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].fishingCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].fishingCashUsdt * currencyMap.get(6).exchangeRate,
      statistics[0].pieCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].pieCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].pieCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].pieCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].pieCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].pieCashUsdt * currencyMap.get(6).exchangeRate,   
      statistics[0].huntingCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].huntingCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].huntingCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].huntingCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].huntingCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].huntingCashUsdt * currencyMap.get(6).exchangeRate,
      statistics[0].ecologyCashUsd * currencyMap.get(2).exchangeRate +
          statistics[0].ecologyCashHkd * currencyMap.get(3).exchangeRate +
          statistics[0].ecologyCashEur * currencyMap.get(5).exchangeRate +
          statistics[0].ecologyCashCny * currencyMap.get(1).exchangeRate +
          statistics[0].ecologyCashThb * currencyMap.get(4).exchangeRate +
          statistics[0].ecologyCashUsdt * currencyMap.get(6).exchangeRate 
    ]
    return amounts;
  }

  async getOverview(userid: number) {
    const overview = {
      totalAssets: 0,
      totalCash: 0,
      totalPositions: 0,
      cash: [],
      positions: [],
      banner: []
    }
    const assetsStatistics = await this.assetsCurdService.findAssetsStatisticsByUserid(userid);
    if(assetsStatistics.length === 0) {
      return overview;
    }
    const assetsStatisticsEntity = assetsStatistics[0];
    overview.totalAssets = assetsStatisticsEntity.totalAssets;
    overview.totalCash = assetsStatisticsEntity.cash;
    overview.totalPositions = assetsStatisticsEntity.positions;
    
    const {
      cashStatistics, positionStatistics
    } = await this.assetsCurdService.findStatisticsOneByUserid(userid);
    
    const cashAmounts = await this.calculateCNY(cashStatistics);
    const positionAmounts = await this.calculateCNY(positionStatistics);
    
    cashAmounts.forEach((amount, index) => {
      overview.cash.push({
        name: StrategyType[index + 1],
        cash: amount,
        positions: positionAmounts[index]
      })
    });
    // positions
    const positions = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userid);
    const positionList = {
      vegetable: {
        name: 'vegetable',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      },
      fruit: {
        name: 'fruit',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      },
      fishing: {
        name: 'fishing',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      },
      pie: {
        name: 'pie',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      },
      hunting: {
        name: 'hunting',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      },
      ecology: {
        name: 'ecology',
        upnl: 0,
        total: 0,
        buysTotal: 0,
        assets: []
      }
    }
    for(const position of positions) {
      const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`) as string) as Assets;
      const assetOld = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}_old`) as string) as Assets;
      if(position.strategy === 1) {
        positionList.vegetable.upnl += position.amount * (asset.price - position.price);
        positionList.vegetable.total += position.amount * asset.price;
        positionList.vegetable.buysTotal += position.amount * position.price;
        positionList.vegetable.assets.push({
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0  
        })
      } else if(position.strategy === 2) {
        positionList.fruit.upnl += position.amount * (asset.price - position.price);
        positionList.fruit.total += position.amount * asset.price;
        positionList.fruit.buysTotal += position.amount * position.price;
        positionList.fruit.assets.push({
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0
        })
      } else if(position.strategy === 3) {
        positionList.fishing.upnl += position.amount * (asset.price - position.price);
        positionList.fishing.total += position.amount * asset.price;
        positionList.fishing.buysTotal += position.amount * position.price;
        positionList.fishing.assets.push({
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0
        })
      } else if(position.strategy === 4) {
        positionList.pie.upnl += position.amount * (asset.price - position.price);
        positionList.pie.total += position.amount * asset.price;
        positionList.pie.buysTotal += position.amount * position.price;
        positionList.pie.assets.push({  
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0
        })
      } else if(position.strategy === 5) {
        positionList.hunting.upnl += position.amount * (asset.price - position.price);
        positionList.hunting.total += position.amount * asset.price;
        positionList.hunting.buysTotal += position.amount * position.price;
        positionList.hunting.assets.push({
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0
        })
      } else if(position.strategy === 6) {  
        positionList.ecology.upnl += position.amount * (asset.price - position.price);
        positionList.ecology.total += position.amount * asset.price;
        positionList.ecology.buysTotal += position.amount * position.price;
        positionList.ecology.assets.push({
          name: asset.name,
          profit: (asset.price - position.price) / position.price // todo price not equal to 0
        })
      }
    }
    // 对资产排序
    positionList.vegetable.assets.sort((a, b) => b.profit - a.profit);
    positionList.fruit.assets.sort((a, b) => b.profit - a.profit);
    positionList.fishing.assets.sort((a, b) => b.profit - a.profit);
    positionList.pie.assets.sort((a, b) => b.profit - a.profit);
    positionList.hunting.assets.sort((a, b) => b.profit - a.profit);
    positionList.ecology.assets.sort((a, b) => b.profit - a.profit);
    // 对每个策略的资产计算upnl
    positionList.vegetable.upnl =  positionList.vegetable.upnl / positionList.vegetable.buysTotal;
    positionList.fruit.upnl =  positionList.fruit.upnl / positionList.fruit.buysTotal;
    positionList.fishing.upnl =  positionList.fishing.upnl / positionList.fishing.buysTotal;
    positionList.pie.upnl =  positionList.pie.upnl / positionList.pie.buysTotal;
    positionList.hunting.upnl =  positionList.hunting.upnl / positionList.hunting.buysTotal;
    positionList.ecology.upnl =  positionList.ecology.upnl / positionList.ecology.buysTotal;
    overview.positions.push(positionList.vegetable);
    overview.positions.push(positionList.fruit);
    overview.positions.push(positionList.fishing);
    overview.positions.push(positionList.pie);
    overview.positions.push(positionList.hunting);
    overview.positions.push(positionList.ecology);
    
    // banner
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const summary = await this.assetsCurdService.findSummaryByUserIdDateTime(
      userid, 
      yesterday
    );

    if(summary) {
      overview.banner.push(summary.content);
      overview.banner.push(`
        昨日收入${summary.incomes}, 支出${summary.expenses}, 锁定盈亏${summary.pnl}, 负债${summary.borrows}, 总盈亏${summary.totalPnl}
      `.trim());
    }
    
    return overview;
  }

  async searchBuysAssets(userid: number, query: string, page: number) {
    const buys = await this.assetsCurdService.findBuysByUseridQuery(userid, query, page);
    return buys;
  }

  async updateBuys(userid: number,updateBuysDto: UpdateBuysDto) {
    // strategy,amount, currencyId 和 price 更新会影响cashpool
    // assetId, currencyId 更新会影响 sells 的 assetId, currencyId
    // amount改变不会影响sells，直接修改historyBuys、间接修改buys
    // price的改变会影响sells
    let shouldUpdateBuys = true;
    if(updateBuysDto.assetId) {
      await this.assetsCurdService.updateSellsAssetId(updateBuysDto.id, updateBuysDto.assetId);
    }
    if(updateBuysDto.currencyId) {
      await this.assetsCurdService.updateSellsCurrencyId(updateBuysDto.id, updateBuysDto.currencyId);
    }
    if(updateBuysDto.price) {
      const sells = await this.assetsCurdService.findSellsByBuysId(updateBuysDto.id);
      for(const sell of sells) {
        const pnl = sell.amount * (sell.sellPrice - updateBuysDto.price);
        await this.assetsCurdService.updateSellsPnlByBuysId(sell.id, pnl);
      }
    }
    if(updateBuysDto.amount) {
      shouldUpdateBuys = false;
      const sells = await this.assetsCurdService.findSellsSumAmountByUserIdAssetId(userid, updateBuysDto.assetId);
      const sellsAmount = sells ? sells.totalAmount : 0;
      await this.assetsCurdService.updateBuysAmount(updateBuysDto.id, sellsAmount, updateBuysDto.amount);
    }
    if(shouldUpdateBuys) await this.assetsCurdService.updateBuys(updateBuysDto);
    if(updateBuysDto.strategy || updateBuysDto.currencyId || updateBuysDto.price || updateBuysDto.amount) {
      const buys = await this.assetsCurdService.findBuysById(updateBuysDto.id);
      await this.assetsCurdService.createBuysCashPool(buys, updateBuysDto.id);
    }
  }

  async updateSells(updateSellsDto: UpdateSellsDto) {
    // 修改buysId，会影响buys和cashpool
    // 修改amount，会影响buys和cashpool
    // 修改sellPrice，会影响cashpool
    if(updateSellsDto.buysId) {
      const sells = await this.assetsCurdService.findSellsById(updateSellsDto.id);
      const amountNeedToAddedToBuys = sells.amount + sells.buys.amount;
      await this.assetsCurdService.updateBuysAmount(sells.buysId, amountNeedToAddedToBuys, -1);
      const newUpdateSellsDto = {
        id: updateSellsDto.id,
        buysId: updateSellsDto.buysId
      }
      await this.assetsCurdService.updateSells(newUpdateSellsDto);
    }
    if(updateSellsDto.amount) {
      const sells = await this.assetsCurdService.findSellsById(updateSellsDto.id);
      const amountNeedToAddedToBuys = sells.amount;
      const pnl = sells.amount * (sells.sellPrice - sells.buys.price);
      const newUpdateSellsDto = {
        id: updateSellsDto.id,
        amount: updateSellsDto.amount,
        pnl: pnl
      }
      await this.assetsCurdService.updateSells(newUpdateSellsDto);
    }
    if(updateSellsDto.sellPrice) {
      const newUpdateSellsDto = {
        id: updateSellsDto.id,
        sellPrice: updateSellsDto.sellPrice
      }
      await this.assetsCurdService.updateSells(newUpdateSellsDto);
    }
    await this.assetsCurdService.updateSells(updateSellsDto);

    if(updateSellsDto.buysId || updateSellsDto.amount || updateSellsDto.sellPrice) {
      const sells = await this.assetsCurdService.findSellsById(updateSellsDto.id);
      await this.assetsCurdService.createSellsCashPool(sells, sells.buys.strategy, sells.id, sells.buys.price);
    }
  }

  async updateIncomes(updateIncomesDto: UpdateIncomesDto) {
    // currencyId, amount, vetetableRatio, fruitRatio, fishingRatio, pieRatio, huntingRatio, ecologyRatio
    // 上面字段更新会影响cashpool
    await this.assetsCurdService.updateIncomes(updateIncomesDto);
    if(updateIncomesDto.currencyId || updateIncomesDto.amount 
      || updateIncomesDto.vegetableRatio || updateIncomesDto.fruitRatio 
      || updateIncomesDto.fishingRatio || updateIncomesDto.pieRatio 
      || updateIncomesDto.huntingRatio || updateIncomesDto.ecologyRatio) {
      const incomes = await this.assetsCurdService.findIncomesById(updateIncomesDto.id);
      await this.assetsCurdService.createIncomesCashPool(incomes, incomes.id);
    }
  }

  async updateExpenses(updateExpensesDto: UpdateExpensesDto) {
    await this.assetsCurdService.updateExpenses(updateExpensesDto);
    if(updateExpensesDto.currencyId || updateExpensesDto.amount 
      || updateExpensesDto.vegetable || updateExpensesDto.furitTree 
      || updateExpensesDto.hunting || updateExpensesDto.ecology 
      || updateExpensesDto.pie) {
      const expenses = await this.assetsCurdService.findExpensesById(updateExpensesDto.id);
      await this.assetsCurdService.createExpensesCashPool(expenses, expenses.id);
    }
  } 

  async updateBorrows(updateBorrowsDto: UpdateBorrowsDto) {
    await this.assetsCurdService.updateBorrows(updateBorrowsDto);
  }

  async createBorrows(createBorrowDto: CreateBorrowDto) {
    await this.assetsCurdService.createBorrow(createBorrowDto);
    this.updateStatistics(createBorrowDto.userId);
  }

  async updateRepays(updateRepaysDto: UpdateRepaysDto) {
    if(updateRepaysDto.borrowId) {
      const repays = await this.assetsCurdService.findRepaysById(updateRepaysDto.id);
      const borrows = await this.assetsCurdService.findBorrowById(repays.borrowId);
      const amountNeedToAddedToBorrows = repays.amount + borrows.amount;
      await this.assetsCurdService.updateBorrowsAmount(repays.borrowId, amountNeedToAddedToBorrows);
    }
    if(updateRepaysDto.amount) {
      const repays = await this.assetsCurdService.findRepaysById(updateRepaysDto.id);
      const borrows = await this.assetsCurdService.findBorrowById(repays.borrowId);
      const amountNeedToAddedToBorrows = (updateRepaysDto.amount - repays.amount) + borrows.amount;
      await this.assetsCurdService.updateBorrowsAmount(repays.borrowId, amountNeedToAddedToBorrows);
    }

    await this.assetsCurdService.updateRepays(updateRepaysDto);
  }

  async createRepays(createRepayDto: CreateRepayDto) {
    await this.assetsCurdService.createRepay(createRepayDto);
    this.updateStatistics(createRepayDto.userId);
  }

  async createPnlItem(items: {strategy: number, totalPNL: number}[],
    userId: number, startDate: Date, ptype: number, categories: number
  ) {
    for(const item of items) {
      const pnlDto = {
        userId: userId,
        pointDate: startDate,
        strategy: item.strategy,
        pnl: item.totalPNL,
        ptype: ptype,
        categories: categories
      }
      this.logger.log(pnlDto);
      const pnlEntity = this.pnlRepository.create(pnlDto);
      this.logger.log(pnlEntity);

      const lastestPnl = await this.assetsCurdService.findPnlLastestByUserId(userId, item.strategy, startDate, ptype, categories);
      if(lastestPnl.length > 0) {
        const lastestPnlEntity = lastestPnl[0];
        pnlEntity.id = lastestPnlEntity.id;
        pnlEntity.pnl += lastestPnlEntity.pnl;
      }
      const result = await this.pnlRepository.save(pnlEntity);
      this.logger.log(result);
    }
  }

  async createPnl(userId: number) {
    await this.assetsCurdService.updatePNLByUserIdCategoriesUpdatePNL(userId, 0, 0);
    this.logger.log(`update pnl ${userId} categories 0 to 0`);

    const sells = await this.assetsCurdService.findSellsPNLByUserId(userId);
    // 这里的pnl直接乘以currencyRate是没有问题的，因为天天更新
    for(const sell of sells) {
      const currency = JSON.parse(await this.cacheManager.get(`currency_${sell.currencyId}`) as string) as Currencies;

      const sellStartDay = new Date(sell.sellTime); 
      sellStartDay.setHours(0, 0, 0, 0);
      const itemsDay = [{strategy: sell.strategy, totalPNL: sell.pnl * currency.exchangeRate}];
      await this.createPnlItem(itemsDay, userId, sellStartDay, 1, 0);
      this.logger.log(`sellStartDay: ${sellStartDay}`);
      
      const sellStartMonth = new Date(sell.sellTime);
      sellStartMonth.setDate(1);
      sellStartMonth.setHours(0, 0, 0, 0);
      const itemsMonth = [{strategy: sell.strategy, totalPNL: sell.pnl * currency.exchangeRate}];
      await this.createPnlItem(itemsMonth, userId, sellStartMonth, 2, 0);
      this.logger.log(`sellStartMonth: ${sellStartMonth}`);

      const sellStartYear = new Date(sell.sellTime);
      sellStartYear.setMonth(0, 1);
      sellStartYear.setDate(1);
      sellStartYear.setHours(0, 0, 0, 0);
      const itemsYear = [{strategy: sell.strategy, totalPNL: sell.pnl * currency.exchangeRate}];
      await this.createPnlItem(itemsYear, userId, sellStartYear, 3, 0);
      this.logger.log(`sellStartYear: ${sellStartYear}`);
    }
  }

  async _createBuysTotalPnlItem(userId: number, buy: Buys, startDate: Date, endDate: Date, buyTime: Date, ptype: number) {
    const endPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(endDate, buy.assetId);
    const endPrice = endPriceEntity.length > 0 ? endPriceEntity[0].price : 0;
    let startPrice = 0;
    if(buyTime.getTime() < endDate.getTime() && buyTime.getTime() >= startDate.getTime()) {
      startPrice = buy.price;
    } else if(buyTime.getTime() < startDate.getTime()) {
      const startPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(startDate, buy.assetId);
      startPrice = startPriceEntity.length > 0 ? startPriceEntity[0].price : 0;
    } else {
      return;
    }
    const pnl = (endPrice - startPrice) * buy.amount;
    const itemsDay = [{strategy: 0, totalPNL: pnl}];
    await this.createPnlItem(itemsDay, userId, startDate, ptype, 1);
  }

  async _createSellsTotalPnlItem(userId: number, sell: Sells, startDate: Date, endDate: Date, sellsDate: Date, buysDate: Date, ptype: number, categories: number) {
    let startPrice = 0;
    let endPrice = 0;

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const sellTime = sellsDate.getTime();
    const buysTime = buysDate.getTime();
    if(buysTime >= startTime && sellTime <= endTime) {
      startPrice = sell.buys.price;
      endPrice = sell.sellPrice;
    } else if(buysTime >= startTime && buysTime < endTime && sellTime > endTime) {
      startPrice = sell.buys.price;
      const endPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(endDate, sell.assetId);
      endPrice = endPriceEntity.length > 0 ? endPriceEntity[0].price : 0;
    } else if(buysTime < startTime && sellTime >= startTime && sellTime < endTime) {
      const startPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(startDate, sell.assetId);
      startPrice = startPriceEntity.length > 0 ? startPriceEntity[0].price : 0;
      endPrice = sell.sellPrice;
    } else {
      return;
    }
    
    const pnl = sell.pnl * sell.exchangeRate;
    const itemsDay = [{strategy: 0, totalPNL: pnl}];
    await this.createPnlItem(itemsDay, userId, startDate, ptype, categories);
  }

  async createTotalPnl(userId: number) {
    await this.assetsCurdService.updatePNLByUserIdCategoriesUpdatePNL(userId, 1, 0);
    this.logger.log(`update pnl ${userId} categories 1 to 0`);

    const buys = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userId);
    for(const buy of buys) {
      const buyTime = new Date(buy.buyTime);
      for(let i = 1; i <= 7; i++) {
        // i days ago
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - i);
        let endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - i + 1);
        await this._createBuysTotalPnlItem(userId, buy, startDate, endDate, buyTime, 1);

        // i month ago
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth() - i, 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 1, 0, 0, 0, 0);
        await this._createBuysTotalPnlItem(userId, buy, startDate, endDate, buyTime, 2);

        // i year ago 
        startDate = new Date(today.getFullYear() - i, 0, 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear() - i + 1, 0, 1, 0, 0, 0, 0);
        await this._createBuysTotalPnlItem(userId, buy, startDate, endDate, buyTime, 3);
      }
    }
    
    const sells = await this.assetsCurdService.findSellsPNLByUserId(userId);
    for(const sell of sells) {
      const buyTime = new Date(sell.buys.buyTime);
      const sellsTime = new Date(sell.sellTime);
      for(let i = 1; i <= 7; i++) {
        // i days ago
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - i);
        let endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - i + 1);
        await this._createSellsTotalPnlItem(userId, sell, startDate, endDate, sellsTime, buyTime, 1, 0);

        // i month ago
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth() - i, 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 1, 0, 0, 0, 0);
        await this._createSellsTotalPnlItem(userId, sell, startDate, endDate, sellsTime, buyTime, 2, 0);  

        // i year ago
        startDate = new Date(today.getFullYear() - i, 0, 1, 0, 0, 0, 0);
        endDate = new Date(today.getFullYear() - i + 1, 0, 1, 0, 0, 0, 0);
        await this._createSellsTotalPnlItem(userId, sell, startDate, endDate, sellsTime, buyTime, 3, 0);
      }
    }
  }

  async getStrategyPnlLines(userid: number, strategy: number, ltype: number) {
    let pnlLines: any[];
    if(strategy === 0) {
      pnlLines = await this.assetsCurdService.findPnlTotalByUserIdPtype(userid, ltype);
    } else {
      pnlLines = await this.assetsCurdService.findPnlByUserIdStrategyPtype(userid, strategy, ltype);
    }
    const endDate = new Date();
    const resultLines = [];
    // 1. 日
    if(ltype === 1) {
      endDate.setHours(0, 0, 0, 0);
      for(let i = 0; i < 10; i++) {
        const date = new Date(endDate);
        // 往前推i天
        date.setDate(date.getDate() - i);
        const pnlLine = pnlLines.find(pnl => pnl.pointDate.getTime() === date.getTime());
        this.logger.log(pnlLine);
        if(pnlLine) {
          resultLines.push({
            dateAt: date,
            pnl: pnlLine.pnl,
            strategy: pnlLine.strategy
          });
        } else {
          resultLines.push({
            dateAt: date,
            strategy: strategy,
            pnl: 0
          });
        }
      }
    } else if(ltype === 2) {
      // 月
      endDate.setDate(1);
      endDate.setHours(0, 0, 0, 0);
      for(let i = 0; i < 10; i++) {
        const date = new Date(endDate);
        // 往前推i个月
        date.setMonth(date.getMonth() - i);
        const pnlLine = pnlLines.find(pnl => pnl.pointDate.getTime() === date.getTime());
        if(pnlLine) {
          resultLines.push({
            dateAt: date,
            pnl: pnlLine.pnl,
            strategy: pnlLine.strategy
          });
        } else {
          resultLines.push({
            dateAt: date,
            strategy: strategy,
            pnl: 0
          });
        }
      }
    } else if(ltype === 3) {
      // 年
      endDate.setMonth(0, 1);
      endDate.setHours(0, 0, 0, 0);
      for(let i = 0; i < 10; i++) {
        const date = new Date(endDate);
        // 往前推i年
        date.setFullYear(date.getFullYear() - i);
        const pnlLine = pnlLines.find(pnl => pnl.pointDate.getTime() === date.getTime());
        if(pnlLine) {
          resultLines.push({
            dateAt: date,
            pnl: pnlLine.pnl,
            strategy: pnlLine.strategy
          });
        } else {
          resultLines.push({
            dateAt: date,
            strategy: strategy,
            pnl: 0
          });
        }
      }
    }
    return resultLines.reverse();
  }

  async _getStrategyCommonPart(userid: number, strategyType: StrategyType) {
    const common = {
      pnl: {
        pnl: 0,
        upnl: 0
      },
      fund: {
        cash: 0,
        positions: 0
      },
      positions: []
    }
    const {
      cashStatistics, positionStatistics
    } = await this.assetsCurdService.findStatisticsOneByUserid(userid);
    const cashAmounts = await this.calculateCNY(cashStatistics);
    const positionAmounts = await this.calculateCNY(positionStatistics);
    this.logger.log(cashAmounts);
    this.logger.log(positionAmounts);
    common.fund.cash = cashAmounts[strategyType - 1];
    common.fund.positions = positionAmounts[strategyType - 1];

    const pnlTotal = await this.assetsCurdService.findPnlSumByUserIdStrategy(userid, strategyType);
    common.pnl.pnl = (pnlTotal && pnlTotal.totalPNL) ? pnlTotal.totalPNL : 0;
    //upnl
    const buys = await this.assetsCurdService.findBuysByUserIdStrategy(userid, strategyType);
    // positions
    const positions = await Promise.all(buys.map(async buy => {
      const asset = buy.assets;
      const buysValue = buy.amount * buy.price;
      const result = {
        name: asset.name,
        buysValue,
        value: buy.amount * asset.price,
        upnl: (asset.price - buy.price) * buy.amount,
        yield: buysValue === 0 ? 0 : (asset.price - buy.price) * buy.amount / buysValue,
        holdingDays: (new Date().getTime() - new Date(buy.buyTime).getTime()) / (1000 * 60 * 60 * 24),
        annualYield: 0,
        category: asset.category,
        market: asset.market,
        code: asset.code,
        bonusRate: asset.bonusRate ? asset.bonusRate : 0.0
      }
      result.annualYield = result.upnl * 365 / result.holdingDays;
      return result;
    }));
    this.logger.log(positions);
    common.pnl.upnl = positions.reduce((acc, curr) => acc + curr.upnl, 0);

    // assets按照common.positions的name的value进行排序，并计算占比
    const assets = positions.sort((a, b) => b.value - a.value);
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);
    const assetPercentages = assets.map(asset => ({
      ...asset,
      percentage: asset.value / totalValue
    }));

    common.positions = assetPercentages;
    return common;
  }

  async getStrategyDetail(userid: number, strategy: number) {
    const common = await this._getStrategyCommonPart(userid, strategy);

    if(strategy === StrategyType.VEGETABLE ||
      strategy === StrategyType.FISHING ||
      strategy === StrategyType.PIE ||
      strategy === StrategyType.HUNTING
    ) {
      return common;
    } else if(strategy === StrategyType.ECOLOGY) {
      const ecology = {
        ...common,
        categories: [],
        markets: []
      }
      const totalValue = common.positions.reduce((acc, curr) => acc + curr.value, 0);
      // categories, markets按照common.positions的category, market进行排序（要对category和market进行去重），并计算占比
      const categories = common.positions.sort((a, b) => b.category - a.category);
      const markets = common.positions.sort((a, b) => b.market - a.market);
      const categoryPercentages = categories.map(category => ({
        name: category.category,
        value: category.value,
        percentage: category.value / totalValue
      }));
      const marketPercentages = markets.map(market => ({
        name: market.market,
        value: market.value,
        percentage: market.value / totalValue
      }));
      ecology.categories = categoryPercentages;
      ecology.markets = marketPercentages;
      return ecology;
    } else if(strategy === StrategyType.FRUIT) {
      const fruit = {
        ...common,
        bonus: {
          annualBonus: 0,
          monthlyBonus: 0,
          positions: [] 
        },
      }
      const bonus = common.positions.map(position => ({
        name: position.name,
        value: position.value,
        // 月股息
        monthlyDividend: (!position.bonusRate || position.bonusRate === -1) ? 0 : position.bonusRate * position.value / 100 / 12,
        // 年股息
        annualDividend: (!position.bonusRate || position.bonusRate === -1) ? 0 : position.bonusRate * position.value / 100,
        nextClaimDate: ''
      }));
      const monthlyBonus = bonus.reduce((acc, curr) => acc + curr.monthlyDividend, 0);
      const annualBonus = bonus.reduce((acc, curr) => acc + curr.annualDividend, 0);
      fruit.bonus.positions = bonus;
      fruit.bonus.annualBonus = annualBonus;
      fruit.bonus.monthlyBonus = monthlyBonus;
      return fruit;
    }
  }

  async getOverviewAssets(userid: number) {
    const assetsStatistics = await this.assetsCurdService.findLastestAssetsStatisticsByUserid(userid);
    return {
      totalAssets: assetsStatistics.totalAssets, // 总资产
      networth: assetsStatistics.networth, // 净资产
      totalLiabilities: assetsStatistics.totalLiabilities, // 总负债
      cash: assetsStatistics.cash, // 现金余额
      pnl: assetsStatistics.pnl, // 总盈亏
      expense: assetsStatistics.expense, // 总支出
      income: assetsStatistics.income, // 总收入
    }
  }

  //////////// three main detail pages
  async getPNLDetails(userid: number) {
    const positivePnl = await this.assetsCurdService.findPnlTotalGroupByStrategyByUserIdDailay(userid, true);
    const negativePnl = await this.assetsCurdService.findPnlTotalGroupByStrategyByUserIdDailay(userid, false);
    const cumulativePnl = [];
    for(let strategy = 1; strategy <= 6; strategy++) {
      const positivePnlLine = positivePnl.find(pnl => pnl.strategy === strategy);
      const negativePnlLine = negativePnl.find(pnl => pnl.strategy === strategy);
      const pTotalPNL = positivePnlLine ? positivePnlLine.totalPNL : 0;
      const nTotalPNL = negativePnlLine ? negativePnlLine.totalPNL : 0;
      cumulativePnl.push({
        strategy: strategy,
        positivePnl: pTotalPNL,
        negativePnl: nTotalPNL,
      });
    }

    const bonus = await this.getBonus(userid);
  
    return {
      cumulativePnl: cumulativePnl,
      bonus: bonus
    }
  }

  async getDebtDetails(userid: number) {
    const positions = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userid);
    const positionMarkets = await Promise.all(positions.map(async position => {
      const asset = JSON.parse(await this.cacheManager.get(`asset_${position.assetId}`)) as Assets;
      const result ={
        name: asset.name,
        value: position.amount * position.price,
        market: asset.market
      }
      return result;
    }));
    const totalValue = positionMarkets.reduce((acc, curr) => acc + curr.value, 0);
    // 合并相同market的数据
    const marketMap = new Map();
    positionMarkets.forEach(position => {
      if(marketMap.has(position.market)) {
        marketMap.set(position.market, marketMap.get(position.market) + position.value);
      } else {
        marketMap.set(position.market, position.value);
      }
    });
    // 对market的value进行排序
    const markets = Array.from(marketMap.entries());
    markets.sort((a, b) => b[1] - a[1]);
    const marketsDistribution = markets.map(market => ({
      market: market[0],
      value: market[1],
      percentage: market[1] / totalValue
    }));

    // 总现金余额
    const assets = await this.assetsCurdService.findAssetsStatisticsByUserid(userid);
    const cashTotal = assets.length > 0 ? assets[0].cash : 0;
    // 各种币种现金余额
    const { cashStatistics } = await this.assetsCurdService.findStatisticsOneByUserid(userid);
    const cashs = {
      cny: 0,
      hkd: 0,
      usd: 0,
      eur: 0,
      thb: 0,
      usdt: 0
    }
    if(cashStatistics.length > 0) {
      cashs.cny = cashStatistics[0].fishingCashCny + cashStatistics[0].fruitCashCny 
        + cashStatistics[0].ecologyCashCny + cashStatistics[0].pieCashCny 
        + cashStatistics[0].vegetableCashCny + cashStatistics[0].huntingCashCny;
      cashs.hkd = cashStatistics[0].fishingCashHkd + cashStatistics[0].fruitCashHkd 
        + cashStatistics[0].ecologyCashHkd + cashStatistics[0].pieCashHkd 
        + cashStatistics[0].vegetableCashHkd + cashStatistics[0].huntingCashHkd;
      cashs.usd = cashStatistics[0].fishingCashUsd + cashStatistics[0].fruitCashUsd 
        + cashStatistics[0].ecologyCashUsd + cashStatistics[0].pieCashUsd 
        + cashStatistics[0].vegetableCashUsd + cashStatistics[0].huntingCashUsd;
      cashs.eur = cashStatistics[0].fishingCashEur + cashStatistics[0].fruitCashEur 
        + cashStatistics[0].ecologyCashEur + cashStatistics[0].pieCashEur
        + cashStatistics[0].vegetableCashEur + cashStatistics[0].huntingCashEur;
      cashs.thb = cashStatistics[0].fishingCashThb + cashStatistics[0].fruitCashThb 
        + cashStatistics[0].ecologyCashThb + cashStatistics[0].pieCashThb
        + cashStatistics[0].vegetableCashThb + cashStatistics[0].huntingCashThb;
      cashs.usdt = cashStatistics[0].fishingCashUsdt + cashStatistics[0].fruitCashUsdt 
        + cashStatistics[0].ecologyCashUsdt + cashStatistics[0].pieCashUsdt
        + cashStatistics[0].vegetableCashUsdt + cashStatistics[0].huntingCashUsdt;
    }
    // 每个季度的总资产、净资产
    // 获取上季度的最后一天的date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentQuarterStart = startOfQuarter(today);
    const lastQuarterEnd = subDays(currentQuarterStart, 1);
    // 获取上上季度最后一天的date
    const lastQuarterStart = startOfQuarter(lastQuarterEnd);
    const last2QuarterEnd = subDays(lastQuarterStart, 1);
    const last2QuarterStart = startOfQuarter(last2QuarterEnd);
    const last3QuarterEnd = subDays(last2QuarterStart, 1);
    this.logger.log(last3QuarterEnd, last2QuarterEnd, lastQuarterEnd, today);
    const assetsStatistics = await Promise.all([
      // startDate都是0点，endDate都是24:00:00.000
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, last3QuarterEnd, new Date(last3QuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, last2QuarterEnd, new Date(last2QuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, lastQuarterEnd, new Date(lastQuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, today, new Date(today.getTime() + 24 * 60 * 60 * 1000))
    ]);
    const assetsLines = [];
    const dateAts = [last3QuarterEnd, last2QuarterEnd, lastQuarterEnd, today];
    for(let i = 0; i < assetsStatistics.length; i++) {
      const statistics = assetsStatistics[i];
      if(statistics.length > 0) {
        assetsLines.push({
          dateAt: dateAts[i],
          networth: statistics[0].networth,
          totalLiabilities: statistics[0].totalLiabilities,
        });
      } else {
        assetsLines.push({
          dateAt: dateAts[i],
          networth: 0,
          totalLiabilities: 0,
        });
      }
    }
    return {
      cashTotal: cashTotal,
      cashs: cashs,
      marketsDistribution,
      assetsLines
    }
  }

  async getIncomeExpenseDetails(userid: number) {
    const currencies = await this.assetsCurdService.findCurrencies();
    const currencyMap = new Map(currencies.map(currency => [currency.id, currency]));
    // 第一季度的起始时间
    const startDate = new Date();
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setMonth(3, 31);
    endDate.setHours(23, 59, 59, 999);
    
    const incomes = await this.assetsCurdService.findIncomesGroupByCurrencyIdByUserIdTimeDuration(userid, startDate, endDate);
    const incomesCurrency = incomes.map(income => {
      const amount = income.totalAmount;
      const currency = income.currencyId as number;
      const value = amount * (currencyMap.has(currency) ? currencyMap.get(currency)?.exchangeRate : 1);
      return value;
    });
    const totalIncome = incomesCurrency.reduce((acc, curr) => acc + curr, 0);
    const expenses = await this.assetsCurdService.findExpensesGroupByCurrencyIdByUserIdTimeDuration(userid, startDate, endDate);
    const expensesCurrency = expenses.map(expense => {
      const amount = expense.totalAmount;
      const currency = expense.currencyId as number;
      const value = amount * (currencyMap.has(currency) ? currencyMap.get(currency)?.exchangeRate : 1);
      return value;
    });
    const totalExpense = expensesCurrency.reduce((acc, curr) => acc + curr, 0);

    // 每个季度的总资产、净资产
    // 获取上季度的最后一天的date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentQuarterStart = startOfQuarter(today);
    const lastQuarterEnd = subDays(currentQuarterStart, 1);
    // 获取上上季度最后一天的date
    const lastQuarterStart = startOfQuarter(lastQuarterEnd);
    const last2QuarterEnd = subDays(lastQuarterStart, 1);
    const last2QuarterStart = startOfQuarter(last2QuarterEnd);
    const last3QuarterEnd = subDays(last2QuarterStart, 1);
    const assetsStatistics = await Promise.all([
      // startDate都是0点，endDate都是24:00:00.000
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, last3QuarterEnd, new Date(last3QuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, last2QuarterEnd, new Date(last2QuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, lastQuarterEnd, new Date(lastQuarterEnd.getTime() + 24 * 60 * 60 * 1000)),
      this.assetsCurdService.findAssetsStatisticsByUseridTimeDuration(userid, today, new Date(today.getTime() + 24 * 60 * 60 * 1000))
    ]);
    const incomeExpenseLines = [];
    const dateAts = [last3QuarterEnd, last2QuarterEnd, lastQuarterEnd, today];
    for(let i = 0; i < assetsStatistics.length; i++) {
      const statistics = assetsStatistics[i];
      if(statistics.length > 0) {
        incomeExpenseLines.push({
          dateAt: dateAts[i],
          incomes: statistics[0].income,
          expenses: statistics[0].expense,
          investIncomes: 0
        });
      } else {
        incomeExpenseLines.push({
          dateAt: dateAts[i],
          incomes: 0,
          expenses: 0,
          investIncomes: 0
        });
      }
    }

    return {
      totalIncome,
      totalExpense,
      incomeExpenseLines
    }
  }

  async getBonus(userid: number) {
    const buys = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userid);
    this.logger.log(buys);
    const limitBuys = buys.filter(buy => buy.assets.bonusRate > 0);
    const bonus = limitBuys.map(position => {
      const value = position.amount * position.price;
      const result = {
        name: position.assets.name,
        // 月股息
        monthlyBonus: position.assets.bonusRate * value / 100 / 12,
        // 年股息
        annualBonus: position.assets.bonusRate * value / 100
      };
      return result;
    });
    // 对bonus按照monthlyDividend进行排序
    const sortedBonus = bonus.sort((a, b) => b.monthlyBonus - a.monthlyBonus);
    const totalMonthlyBonus = sortedBonus.reduce((acc, curr) => acc + curr.monthlyBonus, 0);
    const totalAnnualBonus = sortedBonus.reduce((acc, curr) => acc + curr.annualBonus, 0);
    return {
      totalMonthlyBonus,
      totalAnnualBonus,
      bonus: sortedBonus
    }
  }

  async findYesterdayFluctuationAssets(userId: number) {
    await this.assetsCurdService.updatePNLByUserIdCategoriesUpdatePNL(userId, 1, 0);
    this.logger.log(`update pnl ${userId} categories 1 to 0`);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 1);
    let endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate());
    this.logger.log(startDate, endDate);
    let totalPnl = 0;
    let totalValue = 0;
    const assetsYesterdayPnlMap = new Map();

    const buys = await this.assetsCurdService.findBuysByUserIdAmountGreaterThanZero(userId);
    for(const buy of buys) {
      const buyTime = new Date(buy.buyTime);
      
      const endPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(endDate, buy.assetId);
      const endPrice = endPriceEntity.length > 0 ? endPriceEntity[0].price : 0;
      let startPrice = 0;
      if(buyTime.getTime() < endDate.getTime() && buyTime.getTime() >= startDate.getTime()) {
        startPrice = buy.price;
      } else if(buyTime.getTime() < startDate.getTime()) {
        const startPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(startDate, buy.assetId);
        startPrice = startPriceEntity.length > 0 ? startPriceEntity[0].price : 0;
      } else {
        continue;
      }
      const currencyId = buy.currencyId
      const currency = JSON.parse(await this.cacheManager.get(`currency_${currencyId}`) as string) as Currencies;
      const pnl = (endPrice - startPrice) * buy.amount * currency.exchangeRate;
      this.logger.log(startPrice, endPrice, buy.amount, currency.exchangeRate);
      totalPnl += pnl;
      totalValue += buy.amount * startPrice * currency.exchangeRate;
      if(assetsYesterdayPnlMap.has(buy.assetId)) {
        assetsYesterdayPnlMap.set(buy.assetId, assetsYesterdayPnlMap.get(buy.assetId) + pnl);
      } else {
        assetsYesterdayPnlMap.set(buy.assetId, pnl);
      }
    }
    
    const sells = await this.assetsCurdService.findSellsPNLByUserIdAfterDate(userId, startDate);
    this.logger.log(sells);
    for(const sell of sells) {
      const buyTime = new Date(sell.buys.buyTime);
      const sellsTime = new Date(sell.sellTime);

      let buyPrice = 0;
      let sellPrice = sell.sellPrice;
      if(buyTime.getTime() < startDate.getTime()) {
        const buyEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(startDate, sell.buys.assetId);
        if(buyEntity.length > 0) {
          buyPrice = buyEntity[0].price;
        }
      } else if(buyTime.getTime() >= startDate.getTime()) {
        buyPrice = sell.buys.price;
      }
      if(sellsTime.getTime() > endDate.getTime()) {
        const endPriceEntity = await this.assetsCurdService.findAssetsSnapshotBySnapTimeAssetId(endDate, sell.buys.assetId);
        if(endPriceEntity.length > 0) {
          sellPrice = endPriceEntity[0].price;
        }
      }
      const currencyId = sell.currencyId;
      const currency = JSON.parse(await this.cacheManager.get(`currency_${currencyId}`) as string) as Currencies;
      const pnl = (sellPrice - buyPrice) * sell.amount * currency.exchangeRate;
      this.logger.log(buyPrice, sellPrice, sell.amount, currency.exchangeRate);
      totalPnl += pnl;
      totalValue += sell.amount * buyPrice * currency.exchangeRate;
      if(assetsYesterdayPnlMap.has(sell.assetId)) {
        assetsYesterdayPnlMap.set(sell.assetId, assetsYesterdayPnlMap.get(sell.assetId) + pnl);
      } else {
        assetsYesterdayPnlMap.set(sell.assetId, pnl);
      }
    }

    this.logger.log(assetsYesterdayPnlMap);
    const bestAssetsFluctuations = {
      assetId: -1,
      bestPnlRatio: 0,
      totalPnl,
      totalValue,
      startDate,
    };
    for(const [assetId, pnl] of assetsYesterdayPnlMap.entries()) {
      const pnlRatio = totalValue === 0 ? 0 : pnl / totalValue;
      if(Math.abs(pnlRatio) >= bestAssetsFluctuations.bestPnlRatio) {
        bestAssetsFluctuations.assetId = assetId;
        bestAssetsFluctuations.bestPnlRatio = pnlRatio;
      }
    }
    return bestAssetsFluctuations;
  }

  async getBannerStatistics(userid: number) {
    // 今日零点
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    // 昨日零点
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const incomes = await this.assetsCurdService.findIncomesByUserIdDateDuration(userid, yesterday, date);
    let incomeValue = 0;
    for(const income of incomes) {
      const currencyId = income.currencyId;
      const totalAmount = income.totalAmount;
      const currency = JSON.parse(await this.cacheManager.get(`currency_${currencyId}`) as string) as Currencies;
      incomeValue += totalAmount * currency.exchangeRate;
    }

    const expenses = await this.assetsCurdService.findExpensesByUserIdDateDuration(userid, yesterday, date);
    let expenseValue = 0;
    for(const expense of expenses) {
      const currencyId = expense.currencyId;
      const totalAmount = expense.totalAmount;
      const currency = JSON.parse(await this.cacheManager.get(`currency_${currencyId}`) as string) as Currencies;
      expenseValue += totalAmount * currency.exchangeRate;
    }

    const sells = await this.assetsCurdService.findSellsByUserIdDateDuration(userid, yesterday, date);
    let sellValue = 0;
    for(const sell of sells) {
      const assetId = sell.assetId;
      const asset = JSON.parse(await this.cacheManager.get(`asset_${assetId}`) as string) as Assets;
      const totalAmount = sell.totalAmount;
      const currency = JSON.parse(await this.cacheManager.get(`currency_${asset.currency}`) as string) as Currencies;
      sellValue += totalAmount * currency.exchangeRate;
    }

    const borrows = await this.assetsCurdService.findBorrowsByUserIdDateDuration(userid, yesterday, date);
    let borrowValue = 0;
    for(const borrow of borrows) {
      const currencyId = borrow.currencyId;
      const totalAmount = borrow.totalAmount;
      const currency = JSON.parse(await this.cacheManager.get(`currency_${currencyId}`) as string) as Currencies;
      borrowValue += totalAmount * currency.exchangeRate;
    }
    return {
      incomeValue,
      expenseValue,
      sellValue,
      borrowValue
    };
  }

  async createSummary(userid: number) {
    // summary
    const bestAssetsFluctuations = await this.findYesterdayFluctuationAssets(userid);
    this.logger.log(bestAssetsFluctuations);
    const bannerStatistics = await this.getBannerStatistics(userid);
    this.logger.log(bannerStatistics);
    const assets = await this.assetsCurdService.findAssetsById(bestAssetsFluctuations.assetId);

    const summary = new Summary();
    if(!assets) {
      this.logger.error(`createSummary 资产不存在 ${bestAssetsFluctuations.assetId}`);
      summary.content = `您还没有资产，快去添加吧！`;
    } else {
      const totalRatio = bestAssetsFluctuations.totalValue === 0 ? 0 : bestAssetsFluctuations.totalPnl / bestAssetsFluctuations.totalValue;
      const partitalContent = totalRatio >= 0 ? `上涨${(totalRatio * 100).toFixed(2) + '%'}` : `下跌${(totalRatio * 100).toFixed(2) + '%'}`;
      summary.content = `昨日总资产${partitalContent}, 其中${assets.name}，收益率为${(bestAssetsFluctuations.bestPnlRatio * 100).toFixed(2) + '%'}，为你总结了相关资讯重点，快来看吧！`;
    }

    summary.userid = userid;
    summary.assetId = bestAssetsFluctuations.assetId;
    summary.dateTime = bestAssetsFluctuations.startDate;
    summary.incomes = bannerStatistics.incomeValue;
    summary.expenses = bannerStatistics.expenseValue;
    summary.pnl = bannerStatistics.sellValue;
    summary.borrows = bannerStatistics.borrowValue;
    summary.totalPnl = bestAssetsFluctuations.totalPnl;
    summary.trigger = false;
    await this.assetsCurdService.createSummary(summary);
  }
}