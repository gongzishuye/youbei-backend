import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsCurdService } from './assets.curd';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateBuysDto } from './dto/create-buys.dto';
import { CreateIncomesDto } from './dto/create-incomes.dto';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { CreateRepayDto } from './dto/create-repay.dto';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { CreateCurrenciesDto } from './dto/create-currencies.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { CreateSellsDto } from './dto/create-sells.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateAccountsDto } from './dto/create-accounts.dto';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsCurd: AssetsCurdService
  ) {}

  @Post('/action')
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Post('/action/buys')
  createBuys(@Body() createBuyDto: CreateBuysDto) {
    return this.assetsCurd.createBuys(createBuyDto);
  }

  @Post('/action/sells')
  createSells(@Body() createSellsDto: CreateSellsDto) {
    const totalPartial = createSellsDto.fishingRatio + createSellsDto.fruitRatio + createSellsDto.vegetableRatio + createSellsDto.huntingRatio + createSellsDto.ecologyRatio + createSellsDto.pieRatio  ;
    if (totalPartial !== 100) {
      throw new HttpException('分红比例总和必须为100', HttpStatus.BAD_REQUEST);
    }
    return this.assetsCurd.createSells(createSellsDto);
  }

  @Post('/action/incomes')
  createIncomes(@Body() createIncomesDto: CreateIncomesDto) {
    console.log(createIncomesDto);
    return this.assetsCurd.createIncomes(createIncomesDto);
  }

  @Post('/action/outcomes') 
  createOutcomes(@Body() creatExpenseDto: CreateExpensesDto) {
    return this.assetsCurd.createOutcomes(creatExpenseDto);
  }

  @Post('/action/repays')
  createRepays(@Body() createRepayDto: CreateRepayDto) {
    return this.assetsCurd.createRepay(createRepayDto);
  }

  @Post('/action/borrows')
  createBorrows(@Body() createBorrowDto: CreateBorrowDto) {
    return this.assetsCurd.createBorrow(createBorrowDto);
  }

  @Post('currencies')
  createCurrencies(@Body() createCurrenciesDto: CreateCurrenciesDto) {
    return this.assetsCurd.createCurrencies(createCurrenciesDto);
  }

  @Post('distributions')
  createDistributions(@Body() createDistributionDto: CreateDistributionDto) {
    const totalPartial = createDistributionDto.fishing + createDistributionDto.fruitTree + createDistributionDto.vegetable + createDistributionDto.hunting + createDistributionDto.ecology + createDistributionDto.pie;
    if (totalPartial !== 100) {
      throw new HttpException('分红比例总和必须为100', HttpStatus.BAD_REQUEST);
    }
    return this.assetsCurd.createDistribution(createDistributionDto);
  }

  @Post('accounts')
  createAccounts(@Body() createAccountsDto: CreateAccountsDto) {
    return this.assetsCurd.createAccounts(createAccountsDto);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(+id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}
