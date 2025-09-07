import { Controller, Post, Body, Get, Param, Delete, Request, Query, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from 'src/auth/constants';
import { ChangePasswordDto, LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { AssetsService } from 'src/assets/assets.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AssetsCurdService } from 'src/assets/assets.curd';
import { CreateAccountsDto } from 'src/assets/dto/create-accounts.dto';
import { CreateBuysDto, UpdateBuysDto } from 'src/assets/dto/create-buys.dto';
import { CreateSellsDto, UpdateSellsDto } from 'src/assets/dto/create-sells.dto';
import { CreateIncomesDto, UpdateIncomesDto } from 'src/assets/dto/create-incomes.dto';
import { CreateExpensesDto, UpdateExpensesDto } from 'src/assets/dto/create-expenses.dto';
import { FRONTEND_MOLECULE, MOLECULE } from 'src/assets/assets.constants';

@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  constructor(private readonly adminService: AdminService,
    private readonly assetsService: AssetsService,
    private readonly assetsCurd: AssetsCurdService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  // 注册
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Query('key') key: string) {
    const configKey = this.configService.get('ADMIN_KEY');
    if(key !== configKey) {
      throw new HttpException('Invalid key', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.register(registerDto);
  }

  // 登陆验证
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 修改密码
  @Public()
  @Post('change')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findByUsername('admin');
    if(!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  // 获取所有用户
  @Get('users')
  findAllUsers(@Query('page') page: number, @Query('query') query: string) {
    return this.usersService.findUsersByPageQuery(page, query);
  }

  @Get('/search/assets')
  searchAssets(@Query('query') query: string, @Query('page') page: number) {
    console.log(query, page);
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);

    return this.assetsService.searchAssets(query, page);
  }

  @Get('/assets/accounts')
  getAccounts(@Query('userid') userid: string) {
    return this.assetsCurd.getAccountsByUserid(Number(userid));
  }

  @Post('/assets/accounts')
  createAccounts(@Query('userid') userid: string, @Body() createAccountsDto: CreateAccountsDto) {
    createAccountsDto.owner = Number(userid);
    return this.assetsCurd.createAccounts(createAccountsDto);
  }

  @Post('/action/buys')
  createBuys(@Query('userid') userid: string, @Body() createBuyDto: CreateBuysDto) {
    createBuyDto.userId = Number(userid);
    return this.assetsService.createBuys(createBuyDto);
  }

  @Get('/history/buys')
  getHistoryBuys(@Query('userid') userid: string, @Query('page') page: number, @Query('query') query: string) {
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);

    return this.assetsCurd.findHistoryBuysByUserid(Number(userid), page, query);
  }

  @Post('/action/buys/update')
  async updateBuys(@Query('userid') userid: string, @Body() updateBuysDto: UpdateBuysDto) {
    if(!updateBuysDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);
    if(!updateBuysDto.assetId) throw new HttpException('assetId is required', HttpStatus.BAD_REQUEST);
    this.logger.log(`update buys ${updateBuysDto.id} ${updateBuysDto.assetId}`);
    await this.assetsService.updateBuys(Number(userid), updateBuysDto);
    return {
      buysId: updateBuysDto.id,
    }
  }

  @Post('action/sells/update')
  async updateSells(@Query('userid') userid: string, @Body() updateSellsDto: UpdateSellsDto) {
    if(!updateSellsDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);
    await this.assetsService.updateSells(Number(userid), updateSellsDto);
    return {
      sellsId: updateSellsDto.id,
    }
  }

  @Post('action/incomes/update')
  async updateIncomes(@Query('userid') userid: string, @Body() updateIncomesDto: UpdateIncomesDto) {
    if(!updateIncomesDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);
    await this.assetsService.updateIncomes(Number(userid), updateIncomesDto);
    return {
      incomesId: updateIncomesDto.id,
    }
  }

  @Post('action/expenses/update')
  async updateExpenses(@Query('userid') userid: string, @Body() updateExpensesDto: UpdateExpensesDto) {
    if(!updateExpensesDto.id) throw new HttpException('id is required', HttpStatus.BAD_REQUEST);
    await this.assetsService.updateExpenses(Number(userid), updateExpensesDto);
    return {
      expensesId: updateExpensesDto.id,
    }
  }

  /// history
  @Get('/history/sells')
  getHistorySells(@Query('userid') userid: string, @Query('page') page: number, @Query('query') query: string) {
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistorySellsByUserid(Number(userid), page, query);
  }

  @Get('/history/incomes')
  getHistoryIncomes(@Query('userid') userid: string, @Query('page') page: number, @Query('query') query: string) {
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryIncomesByUserid(Number(userid), page, query);
  }

  @Get('/history/expenses')
  getHistoryExpenses(@Query('userid') userid: string, @Query('page') page: number, @Query('query') query: string) {
    if(!page) new HttpException('page is required', HttpStatus.BAD_REQUEST);
    return this.assetsCurd.findHistoryExpensesByUserid(Number(userid), page, query);
  }

  /// action
  @Post('/action/sells')
  createSells(@Query('userid') userid: string, @Body() createSellsDto: CreateSellsDto) {
    const totalPartial = createSellsDto.fishingRatio + createSellsDto.fruitRatio + createSellsDto.vegetableRatio + createSellsDto.huntingRatio + createSellsDto.ecologyRatio + createSellsDto.pieRatio  ;
    this.logger.log(createSellsDto);
    this.logger.log(`totalPartial: ${totalPartial}`);
    if (totalPartial !== FRONTEND_MOLECULE) {
      throw new HttpException(`分配比例总和必须为${FRONTEND_MOLECULE}`, HttpStatus.BAD_REQUEST);
    }
    const factor = MOLECULE / FRONTEND_MOLECULE;
    createSellsDto.fishingRatio *= factor;
    createSellsDto.fruitRatio *= factor;
    createSellsDto.vegetableRatio *= factor;
    createSellsDto.huntingRatio *= factor;
    createSellsDto.ecologyRatio *= factor;
    createSellsDto.pieRatio *= factor;
    createSellsDto.userId = Number(userid);
    return this.assetsService.createSells(createSellsDto);
  }

  @Post('/action/incomes')
  createIncomes(@Query('userid') userid: string, @Body() createIncomesDto: CreateIncomesDto) {
    const totalPartial = createIncomesDto.fishingRatio + createIncomesDto.fruitRatio + createIncomesDto.vegetableRatio + createIncomesDto.huntingRatio + createIncomesDto.ecologyRatio + createIncomesDto.pieRatio  ;
    this.logger.log(`totalPartial: ${totalPartial}`);
    if (totalPartial !== FRONTEND_MOLECULE) {
      throw new HttpException(`分配比例总和必须为${FRONTEND_MOLECULE}`, HttpStatus.BAD_REQUEST);
    }
    const factor = MOLECULE / FRONTEND_MOLECULE;
    createIncomesDto.fishingRatio *= factor;
    createIncomesDto.fruitRatio *= factor;
    createIncomesDto.vegetableRatio *= factor;
    createIncomesDto.huntingRatio *= factor;
    createIncomesDto.ecologyRatio *= factor;
    createIncomesDto.pieRatio *= factor;
    createIncomesDto.userId = Number(userid);
    
    return this.assetsService.createIncomes(createIncomesDto);
  }

  @Post('/action/expenses')
  createExpenses(@Query('userid') userid: string, @Body() creatExpensesDto: CreateExpensesDto) {
    // 只有在扣除方式为1或2时才验证比例总和
    if (creatExpensesDto.deductedFrom === 1 || creatExpensesDto.deductedFrom === 2) {
      const totalPartial = creatExpensesDto.fishing + creatExpensesDto.furitTree + creatExpensesDto.vegetable + creatExpensesDto.hunting + creatExpensesDto.ecology + creatExpensesDto.pie;
      if (totalPartial !== FRONTEND_MOLECULE) {
        throw new HttpException(`分配比例总和必须为${FRONTEND_MOLECULE}`, HttpStatus.BAD_REQUEST);
      }
      const factor = MOLECULE / FRONTEND_MOLECULE;
      creatExpensesDto.fishing *= factor;
      creatExpensesDto.furitTree *= factor;
      creatExpensesDto.vegetable *= factor;
      creatExpensesDto.hunting *= factor;
      creatExpensesDto.ecology *= factor;
      creatExpensesDto.pie *= factor;
    }
    creatExpensesDto.userId = Number(userid);
    return this.assetsService.createExpenses(creatExpensesDto);
  }

  @Get('/search/buys')
  searchSellsAssets(@Query('userid') userid: string, @Query('query') query: string, @Query('page') page: string) {
    let pageInt = 1;
    if(!page) {
      throw new HttpException('page is required', HttpStatus.BAD_REQUEST);
    }
    pageInt = parseInt(page);
    if(pageInt <= 0) {
      throw new HttpException('page is invalid', HttpStatus.BAD_REQUEST);
    }
    return this.assetsService.searchBuysAssets(Number(userid), query, pageInt);
  }

  @Get('/distributions')
  getDistribution(@Query('userid') userid: string) {
    return this.assetsService.getDistribution(Number(userid));
  }

}
