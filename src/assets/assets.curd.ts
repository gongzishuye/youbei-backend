import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Assets } from './entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { Sells } from './entities/sells.entity';
import { Distribution } from './entities/distribution.entity';
import { Buys } from './entities/buys.entity';
import { Incomes } from './entities/incomes.entity';
import { Expenses } from './entities/expenses.entity';
import { Repay } from './entities/repay.entity';
import { Currencies } from './entities/currencies.entity';
import { CreateBuysDto } from './dto/create-buys.dto';
import { CreateIncomesDto } from './dto/create-incomes.dto';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { CreateRepayDto } from './dto/create-repay.dto';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { CreateCurrenciesDto } from './dto/create-currencies.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { CreateSellsDto } from './dto/create-sells.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CashPool } from './entities/cashpool.entity';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Statistics } from './entities/statistics.entity';
import { Accounts } from './entities/accounts.entity';
import { CreateAccountsDto } from './dto/create-accounts.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class AssetsCurdService {
  constructor(
    @InjectRepository(Assets) private assetsRepository: Repository<Assets>,
    @InjectRepository(Borrow) private borrowRepository: Repository<Borrow>,
    @InjectRepository(Buys) private buysRepository: Repository<Buys>,
    @InjectRepository(Currencies) private currenciesRepository: Repository<Currencies>,
    @InjectRepository(Distribution) private distributionRepository: Repository<Distribution>,
    @InjectRepository(Incomes) private incomesRepository: Repository<Incomes>,
    @InjectRepository(Expenses) private expensesRepository: Repository<Expenses>,
    @InjectRepository(Repay) private repayItemRepository: Repository<Repay>,
    @InjectRepository(Sells) private sellsRepository: Repository<Sells>,
    @InjectRepository(CashPool) private cashpoolRepository: Repository<CashPool>,
    @InjectRepository(AssetsStatistics) private assetsStatisticsRepository: Repository<AssetsStatistics>,
    @InjectRepository(Statistics) private statisticsRepository: Repository<Statistics>,
    @InjectRepository(Accounts) private accountsRepository: Repository<Accounts>,
  ) {}

  createAsset(createAssetDto: CreateAssetDto) {
    const asset = this.assetsRepository.create(createAssetDto);
    return this.assetsRepository.save(asset);
  }

  async createBuys(createBuysDto: CreateBuysDto) {
    const buys = this.buysRepository.create(createBuysDto);
    const buysEntity = await this.buysRepository.save(buys);

    const strategy = buys.strategy;
    const cashpoolEntiry = {
      cashType: 3,
      cashId: buysEntity.id,
      currencyId: buys.currencyId,
      fishingCash: 0,
      fruitCash: 0,
      vegetableCash: 0,
      huntingCash: 0,
      ecologyCash: 0,
      pieCash: 0,
    };
    if(strategy === 1) {
      cashpoolEntiry.fishingCash -= buys.amount;
    } else if(strategy === 2) {
      cashpoolEntiry.fruitCash -= buys.amount;
    } else if(strategy === 3) {
      cashpoolEntiry.vegetableCash -= buys.amount;
    } else if(strategy === 4) {
      cashpoolEntiry.huntingCash -= buys.amount;
    } else if(strategy === 5) {
      cashpoolEntiry.ecologyCash -= buys.amount;
    } else if(strategy === 6) {
      cashpoolEntiry.pieCash -= buys.amount;
    }
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    await this.cashpoolRepository.save(cashpool);
    return buysEntity;
  }

  async createSells(createSellsDto: CreateSellsDto) {
    const buysId = createSellsDto.buysId;
    const buys = await this.findBuyById(buysId);
    if (!buys) {
      throw new HttpException('买入记录不存在', HttpStatus.BAD_REQUEST);
    }
    if(buys.amount < createSellsDto.amount) {
      throw new HttpException('卖出数量大于买入数量', HttpStatus.BAD_REQUEST);
    }
    createSellsDto.amountLeft = buys.amount - createSellsDto.amount;  
    createSellsDto.pnl = createSellsDto.amount * (createSellsDto.sellPrice - buys.price);

    const sells = this.sellsRepository.create(createSellsDto);
    const sellsEntity = await this.sellsRepository.save(sells);
    const sellsSum = sells.amount * sells.sellPrice;
    const strategy = buys.strategy;
    const profit = sells.pnl > 0 ? sells.amount : 0;
    const cashpoolEntiry = {
      cashType: 4,
      cashId: sellsEntity.id,
      currencyId: sellsEntity.currencyId,
      fishingCash: 0,
      fruitCash: 0,
      vegetableCash: 0,
      huntingCash: 0,
      ecologyCash: 0,
      pieCash: 0,
    };
    if(strategy === 1) {
      cashpoolEntiry.fishingCash += (sellsSum + profit);
    } else if(strategy === 2) {
      cashpoolEntiry.fruitCash += (sellsSum + profit);
    } else if(strategy === 3) {
      cashpoolEntiry.vegetableCash += (sellsSum + profit);
    } else if(strategy === 4) {
      cashpoolEntiry.huntingCash += (sellsSum + profit);
    } else if(strategy === 5) {
      cashpoolEntiry.ecologyCash += (sellsSum + profit);
    } else if(strategy === 6) {
      cashpoolEntiry.pieCash += (sellsSum + profit);
    }
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    await this.cashpoolRepository.save(cashpool);
    return sellsEntity;
  }

  async createIncomes(createIncomesDto: CreateIncomesDto) {
    const incomes = this.incomesRepository.create(createIncomesDto);
    const imconesEntiry = await this.incomesRepository.save(incomes);
    const amount = incomes.amount;
    const cashpoolEntiry = {
      cashType: 1,
      cashId: imconesEntiry.id,
      currencyId: incomes.currencyId,
      fishingCash: amount * incomes.fishingRatio / 100,
      fruitCash: amount * incomes.fruitRatio / 100,
      vegetableCash: amount * incomes.vegetableRatio / 100,
      huntingCash: amount * incomes.huntingRatio / 100,
      ecologyCash: amount * incomes.ecologyRatio / 100,
      pieCash: amount * incomes.pieRatio / 100,
    };
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    await this.cashpoolRepository.save(cashpool);
    return imconesEntiry;
  }

  async createOutcomes(createExpensesDto: CreateExpensesDto) {
    const expenses = this.expensesRepository.create(createExpensesDto);
    const expensesEntity = await this.expensesRepository.save(expenses);
    const strategy = expenses.strategy;
    const amount = expenses.amount;
    const cashpoolEntiry = {
      cashType: 2,
      cashId: expensesEntity.id,
      currencyId: expenses.currencyId,
      fishingCash: 0,
      fruitCash: 0,
      vegetableCash: 0,
      huntingCash: 0,
      ecologyCash: 0,
      pieCash: 0,
    };
    if(strategy === 1) {
      cashpoolEntiry.fishingCash -= amount;
    } else if(strategy === 2) {
      cashpoolEntiry.fruitCash -= amount;
    } else if(strategy === 3) {
      cashpoolEntiry.vegetableCash -= amount;
    } else if(strategy === 4) {
      cashpoolEntiry.huntingCash -= amount;
    } else if(strategy === 5) {
      cashpoolEntiry.ecologyCash -= amount;
    } else if(strategy === 6) {
      cashpoolEntiry.pieCash -= amount;
    }
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    await this.cashpoolRepository.save(cashpool);
    return expensesEntity;
  }

  createRepay(createRepayDto: CreateRepayDto) {
    const repay = this.repayItemRepository.create(createRepayDto);
    return this.repayItemRepository.save(repay);  
  }

  createBorrow(createBorrowDto: CreateBorrowDto) {
    const borrow = this.borrowRepository.create(createBorrowDto);
    return this.borrowRepository.save(borrow);
  }

  createCurrencies(createCurrenciesDto: CreateCurrenciesDto) {
    const currencies = this.currenciesRepository.create(createCurrenciesDto);
    return this.currenciesRepository.save(currencies);
  }

  createDistribution(createDistributionDto: CreateDistributionDto) {
    const distribution = this.distributionRepository.create(createDistributionDto);
    distribution.owner = 1;
    return this.distributionRepository.save(distribution);
  }

  createAccounts(createAccountsDto: CreateAccountsDto) {
    const accounts = this.accountsRepository.create(createAccountsDto);
    return this.accountsRepository.save(accounts);
  }

  /////// find ///////
  findBuyById(buysId: number) {
    return this.buysRepository.findOne({ where: { id: buysId } });
  }

  findSellsById(sellsId: number) {
    return this.sellsRepository.findOne({ where: { id: sellsId } });
  }

  findIncomesById(incomesId: number) {
    return this.incomesRepository.findOne({ where: { id: incomesId } });
  }

  findOutcomesById(expensesId: number) {
    return this.expensesRepository.findOne({ where: { id: expensesId } });
  }

  findDistributionById(distributionId: number) {
    return this.distributionRepository.findOne({ where: { id: distributionId } });
  }

  findAll() {
    return `This action returns all assets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  findCashPoolByUserId(userId: number) {
    return this.cashpoolRepository.find({ where: { userId: userId } });
  }

  findBuysByUserId(userId: number) {
    return this.buysRepository.find({ where: { userId: userId } });
  }

  findAssetsStatisticsByUserId(userId: number) {
    return this.assetsStatisticsRepository.find({ where: { userId: userId } });
  }

  findPositionsStatisticsByUserId(userId: number) {
    return this.statisticsRepository.find({ where: { userId: userId } });
  }

  findCashStatisticsByUserId(userId: number) {
    return this.statisticsRepository.find({ where: { userId: userId } });
  }

  findPositionsByUserId(userId: number) {
    return this.buysRepository.find({ where: { userId: userId } });
  }

  findLastestAssetsStatisticsByUserId(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.assetsStatisticsRepository.find({ where: { userId: userId, createdAt: MoreThan(today) }, order: { createdAt: 'DESC' }, take: 1 });
  }

  findBorrowSumByUserId(userId: number) {
    return this.borrowRepository.createQueryBuilder('borrow')
      .select('borrow.currencyId', 'currencyId')
      .addSelect('SUM(borrow.amount)', 'totalAmount')
      .where('borrow.userId = :userId', { userId })
      .groupBy('borrow.currencyId')
      .getRawMany();
  }


  /////// update ///////

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
