import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Assets } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies.entity';
import { Buys } from './entities/buys.entity';
import { Incomes } from './entities/incomes.entity';
import { Expenses } from './entities/expenses.entity';
import { Repays } from './entities/repays.entity';
import { Borrows } from './entities/borrows.entity';
import { Distribution } from './entities/distribution.entity';
import { Sells } from './entities/sells.entity';
import { AssetsCurdService } from './assets.curd';
import { CashPool } from './entities/cashpool.entity';
import { Statistics } from './entities/statistics.entity';
import { AssetsStatistics } from './entities/assets_statistics.entity';
import { Accounts } from './entities/accounts.entity';
import { BuysHistory } from './entities/buyshistory.entity';
import { BorrowsHistory } from './entities/borrowshistory.entity';
import { Pnl } from './entities/pnl.entity';
import { AssetsSnapshot } from './entities/asset_snapshot.entity';
import { ContentModule } from 'src/contents/content.module';
import { Summary } from 'src/contents/entities/summary.entity';
@Module({
  imports: [TypeOrmModule.forFeature([
    Assets,
    Currencies,
    Buys,
    Incomes,
    Expenses,
    Repays,
    Borrows,
    Distribution,
    Sells,
    CashPool,
    Statistics,
    AssetsStatistics,
    Accounts,
    BuysHistory,
    BorrowsHistory,
    Pnl,
    AssetsSnapshot,
    Summary
  ]),
],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsCurdService],
  exports: [AssetsService, AssetsCurdService]
})
export class AssetsModule {}
