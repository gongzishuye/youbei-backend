import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Assets } from './entities/asset.entity';
import { AssetsCurdService } from './assets.curd';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Statistics } from './entities/statistics.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Assets)
    private assetsRepository: Repository<Assets>,
    private assetsCurdService: AssetsCurdService,
    @InjectRepository(AssetsStatistics)
    private assetsStatisticsRepository: Repository<AssetsStatistics>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Assets> {
    const asset = this.assetsRepository.create(createAssetDto);
    return this.assetsRepository.save(asset);
  }

  async findAll(): Promise<Assets[]> {
    return this.assetsRepository.find();
  }

  async findOne(id: number): Promise<Assets> {
    return this.assetsRepository.findOneBy({ id });
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
    };
    return statisticsDto;
  }

  async assetsStatistics(userId: number) {
    const cashPools = await this.assetsCurdService.findCashPoolByUserId(userId);
    
    const cashStatisticsDto = this.getEmptyStatisticsDto(userId);
    let cashTotal = 0;
    for(const cashPool of cashPools) {
      if(cashPool.cashType === 1) {
        // 种菜
        cashStatisticsDto.vegetableCashUsd += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
        cashStatisticsDto.vegetableCashHkd += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
        cashStatisticsDto.vegetableCashEur += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
        cashStatisticsDto.vegetableCashCny += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
        cashStatisticsDto.vegetableCashThb += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
        cashStatisticsDto.vegetableCashUsdt += cashPool.vegetableCash;
        cashTotal += cashPool.vegetableCash * 1;
      } else if(cashPool.cashType === 2) {
        // 狩猎
        cashStatisticsDto.huntingCashUsd += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
        cashStatisticsDto.huntingCashHkd += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
        cashStatisticsDto.huntingCashEur += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
        cashStatisticsDto.huntingCashCny += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
        cashStatisticsDto.huntingCashThb += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
        cashStatisticsDto.huntingCashUsdt += cashPool.huntingCash;
        cashTotal += cashPool.huntingCash * 1;
      } else if(cashPool.cashType === 3) {
        // 捡馅饼
        cashStatisticsDto.pieCashUsd += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
        cashStatisticsDto.pieCashHkd += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
        cashStatisticsDto.pieCashEur += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
        cashStatisticsDto.pieCashCny += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
        cashStatisticsDto.pieCashThb += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
        cashStatisticsDto.pieCashUsdt += cashPool.pieCash;
        cashTotal += cashPool.pieCash * 1;
      } else if(cashPool.cashType === 4) {
        // 钓鱼
        cashStatisticsDto.fishingCashUsd += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
        cashStatisticsDto.fishingCashHkd += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
        cashStatisticsDto.fishingCashEur += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
        cashStatisticsDto.fishingCashCny += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
        cashStatisticsDto.fishingCashThb += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
        cashStatisticsDto.fishingCashUsdt += cashPool.fishingCash;
        cashTotal += cashPool.fishingCash * 1;
      } else if(cashPool.cashType === 5) {
        // 种果树
        cashStatisticsDto.fruitCashUsd += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
        cashStatisticsDto.fruitCashHkd += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
        cashStatisticsDto.fruitCashEur += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
        cashStatisticsDto.fruitCashCny += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
        cashStatisticsDto.fruitCashThb += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
        cashStatisticsDto.fruitCashUsdt += cashPool.fruitCash;
        cashTotal += cashPool.fruitCash * 1;
      } else if(cashPool.cashType === 6) {
        // 生态位
        cashStatisticsDto.ecologyCashUsd += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
        cashStatisticsDto.ecologyCashHkd += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
        cashStatisticsDto.ecologyCashEur += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
        cashStatisticsDto.ecologyCashCny += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
        cashStatisticsDto.ecologyCashThb += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
        cashStatisticsDto.ecologyCashUsdt += cashPool.ecologyCash;
        cashTotal += cashPool.ecologyCash * 1;
      }
    }
    const cashStatistics = this.statisticsRepository.create(cashStatisticsDto);
    await this.statisticsRepository.save(cashStatistics);

    const positionsStatisticsDto = this.getEmptyStatisticsDto(userId);
    const positions = await this.assetsCurdService.findPositionsByUserId(userId);
    let positionsTotal = 0;
    for(const position of positions) {
      if(position.strategy === 1) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.fishingCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.fishingCashHkd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.fishingCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.fishingCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.fishingCashThb += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 6) {
          positionsStatisticsDto.fishingCashUsdt += position.amount;
          positionsTotal += position.amount * 1;
        }
      } else if(position.strategy === 2) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.fruitCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.fruitCashHkd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.fruitCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.fruitCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.fruitCashThb += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 6) {
          positionsStatisticsDto.fruitCashUsdt += position.amount;
          positionsTotal += position.amount * 1;
        }
      } else if(position.strategy === 3) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.vegetableCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.vegetableCashHkd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.vegetableCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.vegetableCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.vegetableCashThb += position.amount;
          positionsTotal += position.amount * 1;
        }
      } else if(position.strategy === 4) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.huntingCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.huntingCashHkd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.huntingCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.huntingCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.huntingCashThb += position.amount;
          positionsTotal += position.amount * 1;
        }
      } else if(position.strategy === 5) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.ecologyCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.ecologyCashHkd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.ecologyCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.ecologyCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.ecologyCashThb += position.amount;
          positionsTotal += position.amount * 1;
        }
      } else if(position.strategy === 6) {
        if(position.currencyId === 1) {
          positionsStatisticsDto.pieCashUsd += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 2) {
          positionsStatisticsDto.pieCashHkd += position.amount;
          positionsTotal += position.amount * 1;  
        } else if(position.currencyId === 3) {
          positionsStatisticsDto.pieCashEur += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 4) {
          positionsStatisticsDto.pieCashCny += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 5) {
          positionsStatisticsDto.pieCashThb += position.amount;
          positionsTotal += position.amount * 1;
        } else if(position.currencyId === 6) {
          positionsStatisticsDto.pieCashUsdt += position.amount;
          positionsTotal += position.amount * 1;
        }
      }
      const positionsStatistics = this.statisticsRepository.create(positionsStatisticsDto);
      await this.statisticsRepository.save(positionsStatistics);
    }
  }

  async singleAssetsStatistics(userId: number, cashTotal: number, positionsTotal: number) {
    const assetsStatisticsDto = {
      userId: userId,
      totalAssets: cashTotal + positionsTotal,
      networth: 0,
      totalLiabilities: 0,
      pnl: 0,
      upnl: 0,
      expense: 0,
      cash: 0,
      positions: 0,
    }
    const borrows = await this.assetsCurdService.findBorrowSumByUserId(userId);
    let totalLiabilities = 0;
    for(const borrow of borrows) {
      if(borrow.currencyId === 1) {
        totalLiabilities += borrow.totalAmount * 1;
      } else if(borrow.currencyId === 2) {
        totalLiabilities += borrow.totalAmount * 1;
      } else if(borrow.currencyId === 3) {
        totalLiabilities += borrow.totalAmount * 1;
      } else if(borrow.currencyId === 4) {
        totalLiabilities += borrow.totalAmount * 1;
      } else if(borrow.currencyId === 5) {
        totalLiabilities += borrow.totalAmount * 1;
      } else if(borrow.currencyId === 6) {
        totalLiabilities += borrow.totalAmount * 1;
      }
      assetsStatisticsDto.totalLiabilities = totalLiabilities;
      assetsStatisticsDto.networth = assetsStatisticsDto.totalAssets - assetsStatisticsDto.totalLiabilities;
      
    }

    const assetsStatistics = await this.assetsCurdService.findLastestAssetsStatisticsByUserId(userId);
    

    
  }
}
