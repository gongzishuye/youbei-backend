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
import { Borrow } from './assets/entities/borrow.entity';
import { Currencies } from './assets/entities/currencies.entity';
import { Distribution } from './assets/entities/distribution.entity';
import { Incomes } from './assets/entities/incomes.entity';
import { Expenses } from './assets/entities/expenses.entity';
import { Repay } from './assets/entities/repay.entity';
import { Sells } from './assets/entities/sells.entity';
import { Buys } from './assets/entities/buys.entity';
import { CashPool } from './assets/entities/cashpool.entity';
import { Statistics } from './assets/entities/statistics.entity';
import { AssetsStatistics } from './assets/entities/assets_statistics.entity';
import { ContentModule } from './contents/content.module';
import { Accounts } from './assets/entities/accounts.entity';
import { ConfigModule } from '@nestjs/config';

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
      host: '10.3.8.11',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'youbei',
      entities: [
        Users, 
        Assets,
        Borrow,
        Currencies,
        Distribution,
        Incomes,
        Expenses,
        Repay,
        Buys,
        Sells,
        CashPool,
        Statistics,
        AssetsStatistics,
        Accounts,
      ],
      synchronize: true,
    }),
    AssetsModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
