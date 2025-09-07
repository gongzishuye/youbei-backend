import { Injectable, Logger } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Assets } from './entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrows } from './entities/borrows.entity';
import { Sells } from './entities/sells.entity';
import { Distribution } from './entities/distribution.entity';
import { Buys } from './entities/buys.entity';
import { Incomes } from './entities/incomes.entity';
import { Expenses } from './entities/expenses.entity';
import { Repays } from './entities/repays.entity';
import { Currencies } from './entities/currencies.entity';
import { CreateBuysDto, UpdateBuysDto } from './dto/create-buys.dto';
import { CreateIncomesDto, UpdateIncomesDto } from './dto/create-incomes.dto';
import { CreateExpensesDto, UpdateExpensesDto } from './dto/create-expenses.dto';
import { CreateRepayDto, UpdateRepaysDto } from './dto/create-repay.dto';
import { CreateBorrowDto, UpdateBorrowsDto } from './dto/create-borrow.dto';
import { CreateCurrenciesDto, UpdateCurrenciesDto } from './dto/create-currencies.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { CreateSellsDto, UpdateSellsDto } from './dto/create-sells.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CashPool } from './entities/cashpool.entity';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Statistics } from './entities/statistics.entity';
import { Accounts } from './entities/accounts.entity';
import { CreateAccountsDto, UpdateAccountsDto, DeleteAccountsDto } from './dto/create-accounts.dto';
import { MoreThan, Equal } from 'typeorm';
import { Brackets } from 'typeorm';
import { Pnl } from './entities/pnl.entity';
import { Between } from 'typeorm';
import { AssetsSnapshot } from './entities/asset_snapshot.entity';
import { Summary } from '../contents/entities/summary.entity';
import { FRONTEND_MOLECULE, MOLECULE } from './assets.constants';
@Injectable()
export class AssetsCurdService {
  private readonly logger = new Logger(AssetsCurdService.name);
  constructor(
    @InjectRepository(Assets) private assetsRepository: Repository<Assets>,
    @InjectRepository(Borrows) private borrowRepository: Repository<Borrows>,
    @InjectRepository(Buys) private buysRepository: Repository<Buys>,
    @InjectRepository(Currencies) private currenciesRepository: Repository<Currencies>,
    @InjectRepository(Distribution) private distributionRepository: Repository<Distribution>,
    @InjectRepository(Incomes) private incomesRepository: Repository<Incomes>,
    @InjectRepository(Expenses) private expensesRepository: Repository<Expenses>,
    @InjectRepository(Repays) private repayItemRepository: Repository<Repays>,
    @InjectRepository(Sells) private sellsRepository: Repository<Sells>,
    @InjectRepository(Accounts) private accountsRepository: Repository<Accounts>,
    @InjectRepository(CashPool) private cashpoolRepository: Repository<CashPool>,
    @InjectRepository(Statistics) private statisticsRepository: Repository<Statistics>,
    @InjectRepository(AssetsStatistics) private assetsStatisticsRepository: Repository<AssetsStatistics>,
    @InjectRepository(Pnl) private pnlRepository: Repository<Pnl>,
    @InjectRepository(AssetsSnapshot) private assetsSnapshotRepository: Repository<AssetsSnapshot>,
    @InjectRepository(Summary) private summaryRepository: Repository<Summary>,
  ) {}

  async createAssets(createAssetDtos: CreateAssetDto[]): Promise<Assets[]> {
    const assets = [];
    for(const createAssetDto of createAssetDtos) {
      const asset = this.assetsRepository.create(createAssetDto);
      assets.push(asset);
    }
    this.logger.log(`new assets length: ${assets.length}`);
    return this.assetsRepository.save(assets);
  }

  async updateAssets(updateAssetDtos: UpdateAssetDto[]): Promise<Assets[]> {
    const assets = [];
    const newAssetDtos = [];
    // 根据updateAssetDtos的code 进行资产更新
    for(const updateAssetDto of updateAssetDtos) {
      const asset = await this.assetsRepository.findOne({ where: { code: updateAssetDto.code } });
      if(asset) {
        if(updateAssetDto.price !== -1) {
          asset.price = updateAssetDto.price;
        }
        asset.bonusRate = updateAssetDto.bonusRate;
        assets.push(asset);
      } else {
        newAssetDtos.push(updateAssetDto);
      }
    }
    if(newAssetDtos.length > 0) {
      for(const dto of newAssetDtos) {
        const asset = this.assetsRepository.create(dto);
        assets.push(asset);
      }
    }
    this.logger.log(`update assets length: ${assets.length}`);
    return this.assetsRepository.save(assets);
  }

  async createBuysCashPool(buysEntity: Buys, cashpoolid: number) {
    const strategy = buysEntity.strategy;
    const cashpoolEntiry = {
      cashType: 3,
      userId: buysEntity.userId,
      cashId: buysEntity.id,
      currencyId: buysEntity.currencyId,
      fishingCash: 0,
      fruitCash: 0,
      vegetableCash: 0,
      huntingCash: 0,
      ecologyCash: 0,
      pieCash: 0,
    };
    if(!buysEntity.financing) {
      if(strategy === 1) {
        cashpoolEntiry.vegetableCash -= buysEntity.amount * buysEntity.price;
      } else if(strategy === 2) {
        cashpoolEntiry.fruitCash -= buysEntity.amount * buysEntity.price;
      } else if(strategy === 3) {
        cashpoolEntiry.fishingCash -= buysEntity.amount * buysEntity.price;
      } else if(strategy === 4) {
        cashpoolEntiry.pieCash -= buysEntity.amount * buysEntity.price;
      } else if(strategy === 5) {
        cashpoolEntiry.huntingCash -= buysEntity.amount * buysEntity.price;
      } else if(strategy === 6) {      
        cashpoolEntiry.ecologyCash -= buysEntity.amount * buysEntity.price;
      }
    }
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    if(cashpoolid) cashpool.id = cashpoolid;
    await this.cashpoolRepository.save(cashpool);
  }

  async createBuys(createBuysDto: CreateBuysDto) {
    const buys = this.buysRepository.create(createBuysDto);
    buys.amountOri = buys.amount;
    buys.totalPay = buys.amount * buys.price;
    const buysEntity = await this.buysRepository.save(buys);
    await this.createBuysCashPool(buysEntity, undefined);
    return buysEntity;
  }

  async updateBuys(updateBuysDto: UpdateBuysDto) {
    await this.buysRepository.update(updateBuysDto.id, updateBuysDto);
  }

  async updateBuysAmount(buysId: number, amount: number) {
    if(amount !== -1) await this.buysRepository.update(buysId, { amount });
  }

  async createSellsCashPool(sellsEntity: Sells, strategy: number, cashpoolid: number, buysPrice: number) {
    const recovery = sellsEntity.pnl < 0 ? sellsEntity.amount * sellsEntity.sellPrice 
        : sellsEntity.amount * buysPrice;
    const profit = sellsEntity.pnl > 0 ? sellsEntity.pnl : 0;
    const cashpoolEntiry = {
      cashType: 4,
      cashId: sellsEntity.id,
      currencyId: sellsEntity.currencyId,
      fishingCash: profit * sellsEntity.fishingRatio / MOLECULE,
      fruitCash: profit * sellsEntity.fruitRatio / MOLECULE,
      vegetableCash: profit * sellsEntity.vegetableRatio / MOLECULE,
      huntingCash: profit * sellsEntity.huntingRatio / MOLECULE,
      ecologyCash: profit * sellsEntity.ecologyRatio / MOLECULE,
      pieCash: profit * sellsEntity.pieRatio / MOLECULE,
      userId: sellsEntity.userId,
    };
    if(strategy === 1) {
      cashpoolEntiry.vegetableCash += recovery;
    } else if(strategy === 2) {
      cashpoolEntiry.fruitCash += recovery;
    } else if(strategy === 3) {
      cashpoolEntiry.fishingCash += recovery;
    } else if(strategy === 4) {
      cashpoolEntiry.pieCash += recovery;
    } else if(strategy === 5) {
      cashpoolEntiry.huntingCash += recovery;
    } else if(strategy === 6) {
      cashpoolEntiry.ecologyCash += recovery;
    }
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    if(cashpoolid) cashpool.id = cashpoolid;
    await this.cashpoolRepository.save(cashpool);
  }

  async createSells(createSellsDto: CreateSellsDto) {
    const buysId = createSellsDto.buysId;
    const buys = await this.findBuyById(buysId);
    if (!buys) {
      throw new HttpException('买入记录不存在', HttpStatus.BAD_REQUEST);
    }
    if(buys.userId !== createSellsDto.userId) {
      throw new HttpException('卖出记录不属于当前用户', HttpStatus.BAD_REQUEST);
    }
    if(buys.amount < createSellsDto.amount) {
      throw new HttpException('卖出数量大于买入数量', HttpStatus.BAD_REQUEST);
    }
    createSellsDto.amountLeft = buys.amount - createSellsDto.amount;  
    createSellsDto.pnl = createSellsDto.amount * (createSellsDto.sellPrice - buys.price);

    const sells = this.sellsRepository.create(createSellsDto);
    const sellsEntity = await this.sellsRepository.save(sells);
    buys.amount = createSellsDto.amountLeft;
    await this.buysRepository.save(buys);
    await this.createSellsCashPool(sellsEntity, buys.strategy, undefined, buys.price);
    
    return sellsEntity;
  }

  async updateSells(updateSellsDto: UpdateSellsDto) {
    await this.sellsRepository.update(updateSellsDto.id, updateSellsDto);
  }

  async createIncomesCashPool(incomesEntity: Incomes, cashpoolid: number) {
    const amount = incomesEntity.amount;
    const cashpoolEntiry = {
      cashType: 1,
      cashId: incomesEntity.id,
      currencyId: incomesEntity.currencyId,
      fishingCash: amount * incomesEntity.fishingRatio / MOLECULE,
      fruitCash: amount * incomesEntity.fruitRatio / MOLECULE,
      vegetableCash: amount * incomesEntity.vegetableRatio / MOLECULE,
      huntingCash: amount * incomesEntity.huntingRatio / MOLECULE,
      ecologyCash: amount * incomesEntity.ecologyRatio / MOLECULE,
      pieCash: amount * incomesEntity.pieRatio / MOLECULE,
      userId: incomesEntity.userId,
    };
    const cashpool = this.cashpoolRepository.create(cashpoolEntiry);
    if(cashpoolid) cashpool.id = cashpoolid;
    await this.cashpoolRepository.save(cashpool);
  }

  async createIncomes(createIncomesDto: CreateIncomesDto) {
    const incomes = this.incomesRepository.create(createIncomesDto);
    const imconesEntiry = await this.incomesRepository.save(incomes);
    await this.createIncomesCashPool(imconesEntiry, undefined);
    return imconesEntiry;
  }

  async createExpensesCashPool(expensesEntity: Expenses, cashpoolid: number) {
    const cashpool = {
      cashType: 2,
      cashId: expensesEntity.id,
      currencyId: expensesEntity.currencyId,
      fishingCash: expensesEntity.fishing / MOLECULE * expensesEntity.amount,
      fruitCash: expensesEntity.furitTree / MOLECULE * expensesEntity.amount,
      vegetableCash: expensesEntity.vegetable / MOLECULE * expensesEntity.amount,
      huntingCash: expensesEntity.hunting / MOLECULE * expensesEntity.amount,
      ecologyCash: expensesEntity.ecology / MOLECULE * expensesEntity.amount,
      pieCash: expensesEntity.pie / MOLECULE * expensesEntity.amount,
      userId: expensesEntity.userId,
    };
    const cashpoolEntity = this.cashpoolRepository.create(cashpool);
    if(cashpoolid) cashpoolEntity.id = cashpoolid;
    await this.cashpoolRepository.save(cashpoolEntity)
  }

  async createExpenses(createExpensesDto: CreateExpensesDto) {
    createExpensesDto.equRmb = createExpensesDto.amount * createExpensesDto.exchangeRate;
    const expenses = this.expensesRepository.create(createExpensesDto);
    const expensesEntity = await this.expensesRepository.save(expenses);
    await this.createExpensesCashPool(expensesEntity, undefined);
    return expensesEntity;
  }

  async createRepay(createRepayDto: CreateRepayDto) {
    if(createRepayDto.borrowId) {
      const borrow = await this.findBorrowById(createRepayDto.borrowId);
      if(!borrow) {
        throw new HttpException('借款记录不存在', HttpStatus.BAD_REQUEST);
      }
      if(borrow.userId !== createRepayDto.userId) {
        throw new HttpException('还款记录不属于当前用户', HttpStatus.BAD_REQUEST);
      }
      if(borrow.amount < createRepayDto.amount) {
        throw new HttpException('还款金额大于借款金额', HttpStatus.BAD_REQUEST);
      }
      borrow.amount -= createRepayDto.amount;
      await this.borrowRepository.save(borrow);
    }
    const repay = this.repayItemRepository.create(createRepayDto);
    const repayEntity = await this.repayItemRepository.save(repay);
    return {
      repayId: repayEntity.id,
    }
  }

  async createBorrow(createBorrowDto: CreateBorrowDto) {
    const borrow = this.borrowRepository.create(createBorrowDto);
    const borrowEntity = await this.borrowRepository.save(borrow);
    return {
      borrowId: borrowEntity.id,
    }
  }

  async createCurrencies(createCurrenciesDto: CreateCurrenciesDto) {
    const currenciesEntity = await this.findCurrenciesByName(createCurrenciesDto.name);
    if(currenciesEntity) {
      throw new HttpException('货币已存在', HttpStatus.BAD_REQUEST);
    }
    const currencies = this.currenciesRepository.create(createCurrenciesDto);
    return this.currenciesRepository.save(currencies);
  }

  async updateCurrencies(updateCurrenciesDto: UpdateCurrenciesDto) {
    const currenciesEntity = await this.findCurrenciesByName(updateCurrenciesDto.name);
    if(currenciesEntity) {
      updateCurrenciesDto.id = currenciesEntity.id;
    }
    await this.currenciesRepository.save(updateCurrenciesDto);
  }

  saveDistribution(distribution: Distribution) {
    return this.distributionRepository.save(distribution);
  }

  findDistributionByUserId(userid: number) {
    return this.distributionRepository.find({ where: { owner: userid }, order: { id: 'DESC' } });
  }

  createAccounts(createAccountsDto: CreateAccountsDto) {
    const accounts = this.accountsRepository.create(createAccountsDto);
    return this.accountsRepository.save(accounts);
  }

  async updateAccounts(updateAccountsDto: UpdateAccountsDto) {
    const accounts = await this.accountsRepository.findOne({ where: { id: updateAccountsDto.id } });
    if(!accounts) {
      throw new HttpException('账户不存在', HttpStatus.BAD_REQUEST);
    }
    if(accounts.owner !== updateAccountsDto.owner) {
      throw new HttpException('账户不属于当前用户', HttpStatus.BAD_REQUEST);
    }
    return this.accountsRepository.save(updateAccountsDto);
  }

  async deleteAccounts(userid: number, deleteAccountsDto: DeleteAccountsDto) {
    const accounts = await this.accountsRepository.findOne({ where: { id: deleteAccountsDto.id } });
    if(!accounts) {
      throw new HttpException('账户不存在', HttpStatus.BAD_REQUEST);
    }
    if(accounts.owner !== userid) {
      throw new HttpException('账户不属于当前用户', HttpStatus.BAD_REQUEST);
    }
    return this.accountsRepository.delete(deleteAccountsDto.id);
  }

  createPnl(pnl: Pnl) {
    return this.pnlRepository.save(pnl);
  }

  /////// find ///////

  findPnltByUserIdPointDate(userId: number, strategy: number, startDate: Date, ptype: number, categories: number) {
    // 时间大于等于startDate
    return this.pnlRepository.find({ where: { userId: userId, 
      pointDate: Equal(startDate), strategy: strategy,
      ptype: ptype,
      categories: categories
    }, 
      order: { pointDate: 'DESC' }, take: 1 
    });
  }

  async findPnlSumByUserIdStrategy(userId: number, strategy: number) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('SUM(pnl.pnl)', 'totalPNL')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.strategy = :strategy', { strategy })
      .andWhere('pnl.ptype = :ptype', { ptype: 3 })
      .getRawOne();
  }

  async findPnlTotalByUserIdPtypeCategories(userId: number, ptype: number, categories: number) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('pnl.pointDate', 'pointDate')
      .addSelect('SUM(pnl.pnl)', 'pnl')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.ptype = :ptype', { ptype })
      .andWhere('pnl.categories = :categories', { categories })
      .groupBy('pnl.pointDate')
      .orderBy('pnl.pointDate', 'DESC')
      .take(10)
      .getRawMany();
  }

  async findPnlTotalByUserIdCategoriesDuration(userId: number, categories: number, startDate: Date, endDate: Date) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('SUM(pnl.pnl)', 'totalPNL')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.categories = :categories', { categories })
      .andWhere('pnl.pointDate >= :startDate', { startDate })
      .andWhere('pnl.pointDate <= :endDate', { endDate })
      .andWhere('pnl.ptype = :ptype', { ptype: 2 })
      .getRawOne();
  }

  async findPnlTotalGroupByStrategyByUserIdDailay(userId: number, positivePnl: boolean) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('pnl.strategy', 'strategy')
      .addSelect('SUM(pnl.pnl)', 'totalPNL')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.ptype = :ptype', { ptype: 1 })
      .andWhere(positivePnl ? 'pnl.pnl > 0' : 'pnl.pnl < 0')
      .groupBy('pnl.strategy')
      .getRawMany();
  }

  async findPnlByUserIdStrategyPtype(userId: number, strategy: number, ptype: number) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('pnl.pointDate', 'pointDate')
      .addSelect('pnl.strategy', 'strategy')
      .addSelect('SUM(pnl.pnl)', 'pnl')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.strategy = :strategy', { strategy })
      .andWhere('pnl.ptype = :ptype', { ptype }) 
      .groupBy('pnl.pointDate')
      .orderBy('pnl.pointDate', 'DESC')
      .take(10)
      .getRawMany();
  }

  findBuyById(buysId: number) {
    return this.buysRepository.findOne({ where: { id: buysId } });
  }

  findSellsById(sellsId: number) {
    return this.sellsRepository.findOne({ 
      where: { id: sellsId },
      relations: ['buys']
    });
  }

  findSellsSumPNLByUserId(userId: number) {
    return this.sellsRepository.createQueryBuilder('sells')
      .select('SUM(sells.pnl)', 'totalPNL')
      .addSelect('sells.currencyId', 'currencyId')
      .where('sells.userId = :userId', { userId })
      .groupBy('sells.currencyId')
      .getRawMany();
  }

  findSellsPNLByUserId(userId: number) {
    // need to join buys to get strategy
    return this.sellsRepository.createQueryBuilder('sells')
      .leftJoinAndSelect('sells.buys', 'buys')
      .where('sells.userId = :userId', { userId })
      .getMany();
  }

  findSellsPNLByUserIdAfterDate(userId: number, date: Date) {
    return this.sellsRepository.find({
      where: {
        userId: userId,
        sellTime: MoreThan(date)
      },
      relations: ['buys']
    });
  }

  findSellsSumAmountByUserIdAssetId(userId: number, assetId: number) {
    return this.sellsRepository.createQueryBuilder('sells')
      .select('SUM(sells.amount)', 'totalAmount')
      .where('sells.userId = :userId', { userId })
      .andWhere('sells.assetId = :assetId', { assetId })
      .getRawOne();
  }

  findSellsByUserIdDateDuration(userId: number, startDate: Date, endDate: Date) {
    return this.sellsRepository.createQueryBuilder('sells')
      .select('sells.assetId', 'assetId')
      .addSelect('SUM(sells.amount)', 'totalAmount')
      .where('sells.userId = :userId', { userId })
      .andWhere('sells.sellTime >= :startDate', { startDate })
      .andWhere('sells.sellTime <= :endDate', { endDate })
      .groupBy('sells.assetId')
      .getRawMany();
  }

  findPNLSumPNLGroupByStrategyByUserIdPType(userId: number, ptype: number) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .select('pnl.strategy', 'strategy')
      .addSelect('SUM(pnl.pnl)', 'totalPNL')
      .where('pnl.userId = :userId', { userId })
      .andWhere('pnl.ptype = :ptype', { ptype })
      .groupBy('pnl.strategy')
      .getRawMany();
  }

  updatePNLByUserIdCategoriesUpdatePNL(userId: number, categories: number, pnl: number) {
    return this.pnlRepository.createQueryBuilder('pnl')
      .update()
      .set({ pnl })
      .where('userId = :userId', { userId })
      .andWhere('categories = :categories', { categories })
      .execute();
  }

  findExpensesGroupByCurrencyIdByUserId(userId: number) {
    return this.expensesRepository.createQueryBuilder('expenses')
      .select('expenses.currencyId', 'currencyId')
      .addSelect('SUM(expenses.amount)', 'totalAmount')
      .where('expenses.userId = :userId', { userId })
      .groupBy('expenses.currencyId')
      .getRawMany();
  }

  findExpensesById(expensesId: number) {
    return this.expensesRepository.findOne({ where: { id: expensesId } });
  }

  findExpensesByUserIdDateDuration(userid: number, startDate: Date, endDate: Date) {
    return this.expensesRepository.createQueryBuilder('expenses')
      .select('expenses.currencyId', 'currencyId')
      .addSelect('SUM(expenses.amount)', 'totalAmount')
      .where('expenses.userId = :userid', { userid })
      .andWhere('expenses.expensesTime >= :startDate', { startDate })
      .andWhere('expenses.expensesTime <= :endDate', { endDate })
      .groupBy('expenses.currencyId')
      .getRawMany();
  }

  findIncomesById(incomesId: number) {
    return this.incomesRepository.findOne({ where: { id: incomesId } });
  }

  findIncomesByUserIdDateDuration(userid: number, startDate: Date, endDate: Date) {
    return this.incomesRepository.createQueryBuilder('incomes')
      .select('incomes.currencyId', 'currencyId')
      .addSelect('SUM(incomes.amount)', 'totalAmount')
      .where('incomes.userId = :userid', { userid })
      .andWhere('incomes.incomeTime >= :startDate', { startDate })
      .andWhere('incomes.incomeTime <= :endDate', { endDate })
      .groupBy('incomes.currencyId')
      .getRawMany();
  }

  findIncomesGroupByCurrencyIdByUserIdTimeDuration(userid: number, startDate: Date, endDate: Date) {
    return this.incomesRepository.createQueryBuilder('incomes')
      .select('incomes.currencyId', 'currencyId')
      .addSelect('SUM(incomes.amount)', 'totalAmount')
      .where('incomes.userId = :userid', { userid })
      .andWhere('incomes.incomeTime >= :startDate', { startDate })
      .andWhere('incomes.incomeTime <= :endDate', { endDate })
      .groupBy('incomes.currencyId')
      .getRawMany();
  }

  findIncomesGroupByCurrencyIdByUserId(userid: number) {
    return this.incomesRepository.createQueryBuilder('incomes')
      .select('incomes.currencyId', 'currencyId')
      .addSelect('SUM(incomes.amount)', 'totalAmount')
      .where('incomes.userId = :userid', { userid })
      .groupBy('incomes.currencyId')
      .getRawMany();
  }
  
  findExpensesGroupByCurrencyIdByUserIdTimeDuration(userid: number, startDate: Date, endDate: Date) {
    return this.expensesRepository.createQueryBuilder('expenses')
      .select('expenses.currencyId', 'currencyId')
      .addSelect('SUM(expenses.amount)', 'totalAmount')
      .where('expenses.userId = :userid', { userid })
      .andWhere('expenses.expensesTime >= :startDate', { startDate })
      .andWhere('expenses.expensesTime <= :endDate', { endDate })
      .groupBy('expenses.currencyId')
      .getRawMany();
  }

  findDistributionById(distributionId: number) {
    return this.distributionRepository.findOne({ where: { id: distributionId } });
  }

  findAssetsById(assetid: number) {
    return this.assetsRepository.findOne({ where: { id: assetid } });
  }

  findAssetsByCode(code: string) {
    return this.assetsRepository.findOne({ where: { code: code } });
  }

  findCashPoolByUserId(userId: number) {
    return this.cashpoolRepository.find({ where: { userId: userId } });
  }

  findBuysByUserIdAmountGreaterThanZero(userId: number) {
    return this.buysRepository.find({ 
      where: { userId, amount: MoreThan(0) }, 
      relations: ['assets']
    });
  }

  findBuysByUserIdStrategy(userId: number, strategy: number) {
    // return queryBuilder.getMany();
    return this.buysRepository.find({ 
      where: { userId: userId, strategy: strategy, amount: MoreThan(0) },
      relations: ['assets']
    });
  }

  findBuysAmountMulPriceByUserId(userId: number) {
    return this.buysRepository.createQueryBuilder('buys')
      .select('buys.assetId', 'assetId')
      .leftJoinAndSelect('buys.assets', 'assets')
      .addSelect('(buys.amount * buys.price)', 'totalValue')
      .where('buys.userId = :userId', { userId })
      .orderBy('totalValue', 'DESC')
      .take(1)
      .getRawOne();
  }

  findPositionsStatisticsByUserId(userId: number) {
    return this.statisticsRepository.find({ where: { userId: userId } });
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
      .andWhere('borrow.borrowTime >= :today', { today: new Date() })
      .groupBy('borrow.currencyId')
      .getRawMany();
  }

  findBorrowsByUserIdDateDuration(userid: number, startDate: Date, endDate: Date) {
    return this.borrowRepository.createQueryBuilder('borrow')
      .select('borrow.currencyId', 'currencyId')
      .addSelect('SUM(borrow.amount)', 'totalAmount')
      .where('borrow.userId = :userid', { userid })
      .andWhere('borrow.borrowTime >= :startDate', { startDate })
      .andWhere('borrow.borrowTime <= :endDate', { endDate })
      .groupBy('borrow.currencyId')
      .getRawMany();
  }

  findBorrowsHistoryByUserId(userId: number) {
    return this.borrowRepository.find({ where: { userId: userId } });
  }

  findBuysCountByUserIdAndAssetId(userId: number, assetId: number) {
    return this.buysRepository.count({ 
      where: { 
        userId: userId,
        assetId: assetId 
      }
    });
  }

  async findBuysByUseridQuery(userId: number, query: string, page: number) {
    const queryBuilder = this.buysRepository.createQueryBuilder('buys')
        .leftJoinAndSelect('buys.assets', 'assets')
        .where('buys.userId = :userId', { userId });

    // 只有当 query 存在且不为空时才添加搜索条件
    if (query) {
        queryBuilder.andWhere(new Brackets(qb => {
            qb.where('asset.code LIKE :query', { query: `%${query}%` })
              .orWhere('asset.name LIKE :query', { query: `%${query}%` });
        }));
    }

    return queryBuilder
        .orderBy('buys.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
  }

  /////// statistics ///////
  findCashpoolByUserIdGroupByCurrencyId(userId: number) {
    return this.cashpoolRepository.createQueryBuilder('cashpool')
      .select('cashpool.currencyId', 'currencyId')
      .addSelect('SUM(cashpool.fishingCash)', 'fishingCash')
      .addSelect('SUM(cashpool.fruitCash)', 'fruitCash')
      .addSelect('SUM(cashpool.vegetableCash)', 'vegetableCash')
      .addSelect('SUM(cashpool.huntingCash)', 'huntingCash')
      .addSelect('SUM(cashpool.ecologyCash)', 'ecologyCash')
      .addSelect('SUM(cashpool.pieCash)', 'pieCash')
      .where('cashpool.userId = :userId', { userId })
      .groupBy('cashpool.currencyId')
      .getRawMany();
  }

  findAssetsStatisticsByUserid(userid: number) {
    return this.assetsStatisticsRepository.find({ where: { userId: userid }, order: { createdAt: 'DESC' } });
  }

  findAssetsStatisticsByUseridTimeDuration(userid: number, startDate: Date, endDate: Date) {
    return this.assetsStatisticsRepository.find({ where: { userId: userid, createdAt: Between(startDate, endDate) }, order: { createdAt: 'DESC' } });
  }

  findLastestAssetsStatisticsByUserid(userid: number) {
    return this.assetsStatisticsRepository.findOne({ where: { userId: userid }, order: { createdAt: 'DESC' }});
  }

  async findStatisticsOneByUserid(userid: number) {
    const cashStatistics = await this.statisticsRepository.find({ where: { userId: userid, isCash: true }, order: { createdAt: 'DESC' }, take: 1 });
    const positionStatistics = await this.statisticsRepository.find({ where: { userId: userid, isCash: false }, order: { createdAt: 'DESC' }, take: 1 });
    return {
      cashStatistics,
      positionStatistics
    }
  }

  async getAccountsByUserid(userid: number) {
    return this.accountsRepository.find({ where: { owner: userid } });
  }

  /////// update ///////

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }

  ///// history ///////
  findHistoryBuysByUserid(userid: number, page: number, query: string) {
    const whereConditions: any = { userId: userid };
    
    if (query) {
      return this.buysRepository.createQueryBuilder('buys')
        .leftJoinAndSelect('buys.assets', 'assets')
        .where('buys.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('assets.code LIKE :query', { query: `%${query}%` })
            .orWhere('assets.name LIKE :query', { query: `%${query}%` })
            .orWhere('buys.desc LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('buys.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    return this.buysRepository.find({ 
      where: whereConditions,
      order: { id: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
      relations: ['assets']
    });
  }

  async findHistorySellsByUserid(userid: number, page: number, query: string) {
    const whereConditions: any = { userId: userid };

    if (query) {
      return this.sellsRepository.createQueryBuilder('sells')
        .leftJoinAndSelect('sells.assets', 'assets')
        .leftJoinAndSelect('sells.buys', 'buys')
        .where('sells.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('assets.code LIKE :query', { query: `%${query}%` })
            .orWhere('assets.name LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('sells.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    const sells = await this.sellsRepository.find({ 
      where: whereConditions,
      order: { id: 'DESC' },
      skip: (page - 1) * 10,
      take: 10,
      relations: ['assets', 'buys']
    });
    const molecule = MOLECULE / FRONTEND_MOLECULE;
    sells.map(sell => {
      sell.fishingRatio = sell.fishingRatio / molecule;
      sell.fruitRatio = sell.fruitRatio / molecule;
      sell.vegetableRatio = sell.vegetableRatio / molecule;
      sell.huntingRatio = sell.huntingRatio / molecule;
      sell.ecologyRatio = sell.ecologyRatio / molecule;
      sell.pieRatio = sell.pieRatio / molecule;
    });
    return sells;
  }

  async findHistoryIncomesByUserid(userid: number, page: number, query: string) {

    if (query) {
      return this.incomesRepository.createQueryBuilder('incomes')
        .where('incomes.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('incomes.desc LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('incomes.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    const imcomes = await this.incomesRepository.find({ where: { userId: userid }, order: { id: 'DESC' }, skip: (page - 1) * 10, take: 10 });
    const molecule = MOLECULE / FRONTEND_MOLECULE;
    imcomes.map(income => {
      income.fishingRatio = income.fishingRatio / molecule;
      income.fruitRatio = income.fruitRatio / molecule;
      income.vegetableRatio = income.vegetableRatio / molecule;
      income.huntingRatio = income.huntingRatio / molecule;
      income.ecologyRatio = income.ecologyRatio / molecule;
      income.pieRatio = income.pieRatio / molecule;
    });
    return imcomes;
  }

  async findHistoryExpensesByUserid(userid: number, page: number, query: string) {
    if (query) {
      return this.expensesRepository.createQueryBuilder('expenses')
        .where('expenses.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('expenses.desc LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('expenses.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    const expenses = await this.expensesRepository.find({ where: { userId: userid }, order: { id: 'DESC' }, skip: (page - 1) * 10, take: 10 });
    const molecule = MOLECULE / FRONTEND_MOLECULE;
    expenses.map(expense => {
      expense.fishing = expense.fishing / molecule;
      expense.furitTree = expense.furitTree / molecule;
      expense.vegetable = expense.vegetable / molecule;
      expense.hunting = expense.hunting / molecule;
      expense.ecology = expense.ecology / molecule;
      expense.pie = expense.pie / molecule;
    });
    return expenses;
  }

  findHistoryBorrowsByUserid(userid: number, page: number, query: string) {
    if (query) {
      return this.borrowRepository.createQueryBuilder('borrow')
        .where('borrow.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('borrow.desc LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('borrow.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    return this.borrowRepository.find({ where: { userId: userid }, order: { id: 'DESC' }, skip: (page - 1) * 10, take: 10 });
  }

  findHistoryRepaysByUserid(userid: number, page: number, query: string) {
    if (query) {
      return this.repayItemRepository.createQueryBuilder('repayItem')
        .leftJoinAndSelect('repayItem.borrows', 'borrows')
        .where('repayItem.userId = :userid', { userid })
        .andWhere(new Brackets(qb => {
          qb.where('repayItem.desc LIKE :query', { query: `%${query}%` });
        }))
        .orderBy('repayItem.id', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
    }

    return this.repayItemRepository.find({ where: { userId: userid }, order: { id: 'DESC' }, skip: (page - 1) * 10, take: 10, relations: ['borrows'] });
  }


  /////// update ///////
  // 修改incomes表，再修改cashpool表
  async updateIncomes(updateIncomesDto: UpdateIncomesDto) {
    await this.incomesRepository.update(updateIncomesDto.id, updateIncomesDto);
    const incomesList = await this.incomesRepository.find({ where: { id: updateIncomesDto.id } });
    if(incomesList.length === 0) throw new HttpException('incomes收入记录不存在', HttpStatus.BAD_REQUEST);

    const cashpools = await this.cashpoolRepository.find({ where: { cashType: 1, cashId: updateIncomesDto.id } });
    if(cashpools.length === 0) throw new HttpException('cashpool收入记录不存在', HttpStatus.BAD_REQUEST);

    const incomes = incomesList[0];
    const amount = incomes.amount;
    const cashpoolEntiry = {
      cashType: 1,
      cashId: incomes.id,
      currencyId: incomes.currencyId,
      fishingCash: amount * incomes.fishingRatio / MOLECULE,
      fruitCash: amount * incomes.fruitRatio / MOLECULE,
      vegetableCash: amount * incomes.vegetableRatio / MOLECULE,
      huntingCash: amount * incomes.huntingRatio / MOLECULE,
      ecologyCash: amount * incomes.ecologyRatio / MOLECULE,
      pieCash: amount * incomes.pieRatio / MOLECULE,
      userId: incomes.userId,
    };
    this.logger.log(cashpoolEntiry);
    await this.cashpoolRepository.update(cashpools[0].id, cashpoolEntiry);
  }

  async updateExpenses(updateExpensesDto: UpdateExpensesDto) {
    await this.expensesRepository.update(updateExpensesDto.id, updateExpensesDto);
    const expensesList = await this.expensesRepository.find({ where: { id: updateExpensesDto.id } });
    if(expensesList.length === 0) throw new HttpException('expenses支出记录不存在', HttpStatus.BAD_REQUEST);

    const cashpools = await this.cashpoolRepository.find({ where: { cashType: 2, cashId: updateExpensesDto.id } });
    if(cashpools.length === 0) throw new HttpException('cashpool收入记录不存在', HttpStatus.BAD_REQUEST);

    const expenses = expensesList[0];
    const cashpoolEntiry = {
      cashType: 2,
      cashId: expenses.id,
      currencyId: expenses.currencyId,
      fishingCash: expenses.fishing,
      fruitCash: expenses.furitTree,
      vegetableCash: expenses.vegetable,
      huntingCash: expenses.hunting,
      ecologyCash: expenses.ecology,
      pieCash: expenses.pie,
      userId: expenses.userId,
    };
    await this.cashpoolRepository.update(cashpools[0].id, cashpoolEntiry);
  }

  async updateBorrows(updateBorrowsDto: UpdateBorrowsDto) {
    await this.borrowRepository.update(updateBorrowsDto.id, updateBorrowsDto);
  }

  async updateRepays(updateRepaysDto: UpdateRepaysDto) {
    await this.repayItemRepository.update(updateRepaysDto.id, updateRepaysDto);
  }

  async findCurrencies() {
    return await this.currenciesRepository.find();
  }

  async findCurrenciesByName(name: string) {
    return await this.currenciesRepository.findOne({ where: { name } });
  }

  async findBorrowsByUseridQuery(userid: number, query: string, page: number) {
    const queryBuilder = this.borrowRepository.createQueryBuilder('borrow')
        .where('borrow.userId = :userId', { userId: userid });

    // 只有当 query 存在且不为空时才添加搜索条件
    if (query) {
        queryBuilder.andWhere(new Brackets(qb => {
            qb.where('borrow.desc LIKE :query', { query: `%${query}%` })
        }));
    }

    return queryBuilder
        .orderBy('borrow.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
  }

  async updateSellsAssetId(buysId: number, assetId: number) {
    await this.sellsRepository.update({ buysId }, { assetId });
  }

  async updateSellsCurrencyId(buysId: number, currencyId: number) {
    await this.sellsRepository.update({ buysId }, { currencyId });
  }

  async findBuysById(buysId: number) {
    return this.buysRepository.findOne({ where: { id: buysId } });
  }

  async findSellsByBuysId(buysId: number) {
    return this.sellsRepository.find({ where: { buysId } });
  }

  async updateSellsPnlById(id: number, pnl: number) {
    await this.sellsRepository.update({ id }, { pnl });
  }

  async findRepaysById(repaysId: number) {
    return this.repayItemRepository.findOne({ where: { id: repaysId } });
  }

  async findBorrowById(borrowId: number) {
    return this.borrowRepository.findOne({ where: { id: borrowId } });
  }

  async updateBorrowsAmount(borrowId: number, amount: number) {
    await this.borrowRepository.update({ id: borrowId }, { amount });
  }

  async findAssetsSnapshotBySnapTimeAssetId(snapshotTime: Date, assetId: number) {
    return this.assetsSnapshotRepository.find({ where: { snapshotTime, assetId } });
  }

  async createSummary(summary: Summary) {
    return this.summaryRepository.save(summary);
  }

  async findSummaryByUserIdDateTime(userid: number, dateTime: Date) {
    return this.summaryRepository.find({ 
      where: { userid, dateTime },
      order: { createdAt: 'DESC' },
      take: 1
    });
  }
}
