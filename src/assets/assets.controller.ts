import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, Logger } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsCurdService } from './assets.curd';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateBuysDto, UpdateBuysDto } from './dto/create-buys.dto';
import { CreateIncomesDto, UpdateIncomesDto } from './dto/create-incomes.dto';
import { CreateExpensesDto, UpdateExpensesDto } from './dto/create-expenses.dto';
import { CreateRepayDto, UpdateRepaysDto } from './dto/create-repay.dto';
import { CreateBorrowDto, UpdateBorrowsDto } from './dto/create-borrow.dto';
import { CreateSellsDto, UpdateSellsDto } from './dto/create-sells.dto';
import { CreateCurrenciesDto, UpdateCurrenciesDto } from './dto/create-currencies.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAccountsDto } from './dto/create-accounts.dto';
import { Public } from 'src/auth/constants';

@Controller('assets')
export class AssetsController {
  private readonly logger = new Logger(AssetsController.name);
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsCurd: AssetsCurdService
  ) {}

  @Get('/currencies')
  getCurrencies() {
    return this.assetsService.getCurrencies();
  }

  // update assets price fully
  @Post('/cache/assets/update')
  updateLocalAssets() {
    return this.assetsService.updateLocolAssets(false);
  }

  @Post('/action/assets')
  @Public()
  async createAssets(@Request() req: any, @Body() createAssetDtos: CreateAssetDto[]) {
    for(const createAssetDto of createAssetDtos) {
      createAssetDto.creator = 9527;
    }
    this.logger.log(createAssetDtos);
    await this.assetsCurd.createAssets(createAssetDtos);
    return {
      code: 200,
      message: 'success'
    }
  }

  @Post('/action/assets/update')
  @Public()
  async updateAssets(@Request() req: any, @Body() updateAssetDtos: UpdateAssetDto[]) {
    for(const updateAssetDto of updateAssetDtos) {
      updateAssetDto.creator = 9527;
    }
    await this.assetsCurd.updateAssets(updateAssetDtos);
    return {
      code: 200,
      message: 'success'
    }
  }

  @Post('/action/buys')
  createBuys(@Request() req: any, @Body() createBuyDto: CreateBuysDto) {
    createBuyDto.userId = req.user.userid;
    return this.assetsService.createBuys(createBuyDto);
  }

  @Post('/action/sells')
  createSells(@Request() req: any, @Body() createSellsDto: CreateSellsDto) {
    const totalPartial = createSellsDto.fishingRatio + createSellsDto.fruitRatio + createSellsDto.vegetableRatio + createSellsDto.huntingRatio + createSellsDto.ecologyRatio + createSellsDto.pieRatio  ;
    this.logger.log(createSellsDto);
    this.logger.log(`totalPartial: ${totalPartial}`);
    if (totalPartial !== 100) {
      throw new HttpException('分配比例总和必须为100', HttpStatus.BAD_REQUEST);
    }
    createSellsDto.userId = req.user.userid;
    return this.assetsService.createSells(createSellsDto);
  }

  @Post('/action/incomes')
  createIncomes(@Request() req: any, @Body() createIncomesDto: CreateIncomesDto) {
    const userid = req.user.userid;
    const totalPartial = createIncomesDto.fishingRatio + createIncomesDto.fruitRatio + createIncomesDto.vegetableRatio + createIncomesDto.huntingRatio + createIncomesDto.ecologyRatio + createIncomesDto.pieRatio  ;
    this.logger.log(`totalPartial: ${totalPartial}`);
    if (totalPartial !== 100) {
      throw new HttpException('分配比例总和必须为100', HttpStatus.BAD_REQUEST);
    }
    createIncomesDto.userId = userid;
    
    return this.assetsService.createIncomes(createIncomesDto);
  }

  @Post('/action/expenses') 
  createExpenses(@Request() req: any, @Body() creatExpensesDto: CreateExpensesDto) {
    const total = creatExpensesDto.fishing + creatExpensesDto.furitTree + creatExpensesDto.vegetable + creatExpensesDto.hunting + creatExpensesDto.ecology + creatExpensesDto.pie;
    if (total !== creatExpensesDto.amount) {
      throw new HttpException('策略分配与支出总额不相等', HttpStatus.BAD_REQUEST);
    }
    const userid = req.user.userid;
    creatExpensesDto.userId = userid;
    return this.assetsService.createExpenses(creatExpensesDto);
  }

  @Post('/action/repays')
  createRepays(@Request() req: any, @Body() createRepayDto: CreateRepayDto) {
    const userid = req.user.userid;
    createRepayDto.userId = userid;
    return this.assetsService.createRepays(createRepayDto);
  }

  @Post('/action/borrows')
  createBorrows(@Request() req: any, @Body() createBorrowDto: CreateBorrowDto) {
    const userid = req.user.userid;
    createBorrowDto.userId = userid;
    return this.assetsService.createBorrows(createBorrowDto);
  }

  @Post('/action/currencies')
  createCurrencies(@Body() createCurrenciesDto: CreateCurrenciesDto) {
    return this.assetsCurd.createCurrencies(createCurrenciesDto);
  }

  @Post('/action/currencies/update')
  @Public()
  updateCurrencies(@Body() updateCurrenciesDto: UpdateCurrenciesDto) {
    return this.assetsCurd.updateCurrencies(updateCurrenciesDto);
  }

  @Post('/action/distributions')
  createDistributions(@Body() createDistributionDto: CreateDistributionDto) {
    const totalPartial = createDistributionDto.fishing + createDistributionDto.fruitTree + createDistributionDto.vegetable + createDistributionDto.hunting + createDistributionDto.ecology + createDistributionDto.pie;
    if (totalPartial !== 100) {
      throw new HttpException('分配比例总和必须为100', HttpStatus.BAD_REQUEST);
    }
    return this.assetsCurd.createDistribution(createDistributionDto);
  }

  @Get('/search/assets')
  searchAssets(@Query('query') query: string, @Query('page') page: number) {
    console.log(query, page);
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);

    return this.assetsService.searchAssets(query, page);
  }

  @Get('/search/buys')
  searchSellsAssets(@Request() req: any, @Query('query') query: string, @Query('page') page: number) {
    if(!page) {
      return {
        code: 201,
        message: 'page is required'
      }
    }
    const userid = req.user.userid;
    return this.assetsService.searchBuysAssets(userid, query, page);
  }

  @Get('/action/buys/count')
  countBuys(@Request() req: any, @Query('assetid') assetid: number) {
    if(!assetid) {
      throw new HttpException('assetid is required', HttpStatus.BAD_REQUEST);
    }
    const userid = req.user.userid;
    return this.assetsService.countBuys(userid, assetid);
  }

  @Get('/search/buys')
  searchBuys(@Request() req: any, @Query('query') query: string, @Query('page') page: number) {
    console.log(query, page);
    const userid = req.user.userid;
    if(!page) {
      return {
        code: 201,
        message: 'page is required'
      }
    }
    return this.assetsService.searchBuys(userid, query, page);
  }

  @Get('/search/borrows')
  searchBorrows(@Request() req: any, @Query('query') query: string, @Query('page') page: number) {
    console.log(query, page);
    const userid = req.user.userid;
    if(!page) {
      return {
        code: 201,
        message: 'page is required'
      }
    }
    return this.assetsService.searchBorrows(userid, query, page);
  }

  @Post('accounts')
  createAccounts(@Body() createAccountsDto: CreateAccountsDto) {
    return this.assetsCurd.createAccounts(createAccountsDto);
  }

  @Get('/accounts')
  getAccounts(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsCurd.getAccountsByUserid(userid);
  }

  @Get('/kline')
  getKline(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getKline(userid);
  }

  @Get('/overview')
  getOverview(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getOverview(userid);
  }

  @Get('/overview/assets')
  getOverviewAssets(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getOverviewAssets(userid);
  }

  @Get('/overview/pnl')
  getOverviewPnl(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getPNLDetails(userid);
  }

  @Get('/overview/debt')
  getOverviewDebt(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getDebtDetails(userid);
  }
  
  @Get('/overview/incomexpense')
  getOverviewIncomeExpense(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.getIncomeExpenseDetails(userid);
  }

  @Get('/statistics')
  getStatistics(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.updateStatistics(userid);
  }

  ///// History /////
  @Get('/history/buys')
  getHistoryBuys(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryBuysByUserid(userid, page);
  }

  @Get('/history/sells')
  getHistorySells(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistorySellsByUserid(userid, page);
  }

  @Get('/history/incomes')
  getHistoryIncomes(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryIncomesByUserid(userid, page);
  }

  @Get('/history/expenses')
  getHistoryExpenses(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryExpensesByUserid(userid, page);
  }

  @Get('/history/borrows')
  getHistoryBorrows(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryBorrowsByUserid(userid, page);
  }

  @Get('/history/repays')
  getHistoryRepays(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryRepaysByUserid(userid, page);
  }

  ///// update /////
  @Post('action/buys/update')
  async updateBuys(@Request() req: any, @Body() updateBuysDto: UpdateBuysDto) {
    if(!updateBuysDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    const userid = req.user.userid;
    await this.assetsService.updateBuys(userid, updateBuysDto);
    return {
      buysId: updateBuysDto.id,
    }
  }

  @Post('action/sells/update')
  async updateSells(@Body() updateSellsDto: UpdateSellsDto) {
    if(!updateSellsDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    await this.assetsService.updateSells(updateSellsDto);
    return {
      sellsId: updateSellsDto.id,
    }
  }

  @Post('action/incomes/update')
  async updateIncomes(@Body() updateIncomesDto: UpdateIncomesDto) {
    if(!updateIncomesDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    await this.assetsService.updateIncomes(updateIncomesDto);
    return {
      incomesId: updateIncomesDto.id,
    }
  }

  @Post('action/expenses/update')
  async updateExpenses(@Body() updateExpensesDto: UpdateExpensesDto) {
    if(!updateExpensesDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    await this.assetsService.updateExpenses(updateExpensesDto);
    return {
      expensesId: updateExpensesDto.id,
    }
  }

  @Post('action/repays/update')
  async updateRepays(@Body() updateRepaysDto: UpdateRepaysDto) {
    if(!updateRepaysDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    await this.assetsService.updateRepays(updateRepaysDto);
    return {
      repayId: updateRepaysDto.id,
    }
  }

  @Post('action/borrows/update')
  async updateBorrows(@Body() updateBorrowsDto: UpdateBorrowsDto) {
    if(!updateBorrowsDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);

    await this.assetsService.updateBorrows(updateBorrowsDto);
    return {
      borrowId: updateBorrowsDto.id,
    }
  }

  @Get('/pnl/history')
  getPnlHistory(@Request() req: any, @Query('period') period: string, @Query('strategy') strategy: string, @Query('realized') realized: string) {
    const userid = req.user.userid;
    const periodInt = parseInt(period);
    const strategyInt = parseInt(strategy);
    const realizedBool = realized === 'true';
    this.logger.log('getPnlHistory', periodInt, strategyInt, realizedBool);
    if(isNaN(periodInt) || isNaN(strategyInt)) {
      throw new HttpException('period/strategy is required', HttpStatus.BAD_REQUEST);
    }
    if(periodInt !== 1 && periodInt !== 2 && periodInt !== 3) {
      throw new HttpException('period is invalid', HttpStatus.BAD_REQUEST);
    }
    if(strategyInt < 0 || strategyInt > 6) {  
      throw new HttpException('strategy is invalid', HttpStatus.BAD_REQUEST);
    }
    return this.assetsService.getStrategyPnlLines(userid, strategyInt, periodInt);
  }

  /////// 六大策略详情
  @Get('/strategy')
  getStrategyDetail(@Request() req: any, @Query('stype') stype: string) {
    // strategy 必须为1-6的数字
    if(!stype || parseInt(stype) < 1 || parseInt(stype) > 6) {
      throw new HttpException('strategy is limited to 1-6', HttpStatus.BAD_REQUEST);
    }
    const userid = req.user.userid;
    const strategyInt = parseInt(stype);
    return this.assetsService.getStrategyDetail(userid, strategyInt);
  }

  ///// test
  @Get('/test')
  test() {
    return this.assetsService.createAssetsSnapshot();
  }

  @Get('/test/summary')
  testSummary(@Request() req: any) {
    const userid = req.user.userid;
    return this.assetsService.createSummary(userid);
  }

  @Get('/test/create/pnl')
  testCreatePnl(@Request() req: any, @Query('userid') userid: string) {
    return this.assetsService.createPnl(parseInt(userid));
  }
}
