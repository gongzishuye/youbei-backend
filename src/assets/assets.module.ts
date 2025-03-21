import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Assets } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies.entity';
import { Buys } from './entities/buys.entity';
import { Incomes } from './entities/incomes.entity';
import { Expenses } from './entities/expenses.entity';
import { Repay } from './entities/repay.entity';
import { Borrow } from './entities/borrow.entity';
import { Distribution } from './entities/distribution.entity';
import { Sells } from './entities/sells.entity';
import { AssetsCurdService } from './assets.curd';
import { CashPool } from './entities/cashpool.entity';
import { Statistics } from './entities/statistics.entity';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Accounts } from './entities/accounts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Assets,
    Currencies,
    Buys,
    Incomes,
    Expenses,
    Repay,
    Borrow,
    Distribution,
    Sells,
    CashPool,
    Statistics,
    AssetsStatistics,
    Accounts
  ])],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsCurdService],
})
export class AssetsModule {}
