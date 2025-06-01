import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/users.entity';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { AssetsModule } from './assets/assets.module';
import { Assets } from './assets/entities/asset.entity';
import { Borrows } from './assets/entities/borrows.entity';
import { Currencies } from './assets/entities/currencies.entity';
import { Distribution } from './assets/entities/distribution.entity';
import { Incomes } from './assets/entities/incomes.entity';
import { Expenses } from './assets/entities/expenses.entity';
import { Repays } from './assets/entities/repays.entity';
import { Sells } from './assets/entities/sells.entity';
import { Buys } from './assets/entities/buys.entity';
import { CashPool } from './assets/entities/cashpool.entity';
import { Statistics } from './assets/entities/statistics.entity';
import { AssetsStatistics } from './assets/entities/assets_statistics.entity';
import { ContentModule } from './contents/content.module';
import { Accounts } from './assets/entities/accounts.entity';
import { ConfigModule } from '@nestjs/config';
import { BuysHistory } from './assets/entities/buyshistory.entity';
import { BorrowsHistory } from './assets/entities/borrowshistory.entity';
import { Summary } from './contents/entities/summary.entity';
import { Reference } from './contents/entities/references.entity';
import { ReferenceQuestions } from './contents/entities/reference-questions.entity';
import { CoreArticles } from './contents/entities/core-articles.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './app.interfaces';
import { Dialogs } from './contents/entities/dialogs.entity';
import { DialogsMessage } from './contents/entities/dialogs-messages.entity';
import { SummaryQuestions } from './contents/entities/summary-questions.entity';
import { Pnl } from './assets/entities/pnl.entity';
import { Articles } from './contents/entities/articles.entity';
import { AssetsSnapshot } from './assets/entities/asset_snapshot.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TasksModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule, 
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://:youbei@localhost:6379'),
          ],
        };
      },
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '3.101.18.139',
      port: 3306,
      username: 'root',
      password: 'youbei@123',
      database: 'youbei',
      charset: 'utf8mb4',
      entities: [
        Users, 
        Assets,
        Borrows,
        Currencies,
        Distribution,
        Incomes,
        Expenses,
        Repays,
        Buys,
        Sells,
        CashPool,
        Statistics,
        AssetsStatistics,
        Accounts,
        BuysHistory,
        BorrowsHistory,
        Summary,
        Reference,
        ReferenceQuestions,
        CoreArticles,
        Dialogs,
        DialogsMessage,
        SummaryQuestions,
        Pnl,
        Articles,
        AssetsSnapshot
      ],
      synchronize: true,
    }),
    AssetsModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
