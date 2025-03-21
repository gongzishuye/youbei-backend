import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { tasksConfig, TOKEN } from './tasks.config';
import { UsersService } from '../users/users.service';
import { AssetsCurdService } from '../assets/assets.curd';

@Injectable()
export class TasksAssetsService { 

  constructor(
    private readonly userService: UsersService, 
    private readonly assetsCurdService: AssetsCurdService) {
  }

  @Cron('0 0 * * * *')
  async run() {
    const assetsStatistics = {
      user_id: 0,
      total_assets: 0,
      networth: 0,
      total_liabilities: 0,
      pnl: 0,
      upnl: 0,
      expense: 0,
      cash: 0,
      positions: 0,
    }
    const users = await this.userService.findAll();
    for(const user of users) {
        const cashPools = await this.assetsCurdService.findCashPoolByUserId(user.id);
        const cashStatistics = {
          fishing_cash_usd: 0,
          fishing_cash_hkd: 0,
          fishing_cash_eur: 0,
          fishing_cash_cny: 0,
          fishing_cash_thb: 0,
          fishing_cash_usdt: 0,
          fruit_cash_usd: 0,
          fruit_cash_hkd: 0,
          fruit_cash_eur: 0,
          fruit_cash_cny: 0,
          fruit_cash_thb: 0,
          fruit_cash_usdt: 0,
          vegetable_cash_usd: 0,
          vegetable_cash_hkd: 0,
          vegetable_cash_eur: 0,
          vegetable_cash_cny: 0,
          vegetable_cash_thb: 0,
          vegetable_cash_usdt: 0,
          hunting_cash_usd: 0,
          hunting_cash_hkd: 0,
          hunting_cash_eur: 0,
          hunting_cash_cny: 0,
          hunting_cash_thb: 0,
          hunting_cash_usdt: 0,
          ecology_cash_usd: 0,
          ecology_cash_hkd: 0,
          ecology_cash_eur: 0,
          ecology_cash_cny: 0,
          ecology_cash_thb: 0,
          ecology_cash_usdt: 0,
          pie_cash_usd: 0,
          pie_cash_hkd: 0,
          pie_cash_eur: 0,
          pie_cash_cny: 0,
          pie_cash_thb: 0,
          pie_cash_usdt: 0,
        }
        for(const cashPool of cashPools) {
          const cashPoolCurrency = cashPool.currencyId;
          if(cashPoolCurrency === 1) {
            cashStatistics.fishing_cash_usd += cashPool.fishingCash;
          } else if(cashPoolCurrency === 2) {
            cashStatistics.fishing_cash_hkd += cashPool.fishingCash;
          } else if(cashPoolCurrency === 3) {
            cashStatistics.fishing_cash_eur += cashPool.fishingCash;
          } else if(cashPoolCurrency === 4) {
            cashStatistics.fishing_cash_cny += cashPool.fishingCash;
          } else if(cashPoolCurrency === 5) {
            cashStatistics.fishing_cash_thb += cashPool.fishingCash;
          } else if(cashPoolCurrency === 6) {
            cashStatistics.fishing_cash_usdt += cashPool.fishingCash;
          }
        }
        // await this.assetsCurdService.createCashStatistics(cashStatistics);

        // positions
        const positions = await this.assetsCurdService.findBuysByUserId(user.id);
        const positionsStatistics = {
          fishing_position_usd: 0,
          fishing_position_hkd: 0,
          fishing_position_eur: 0,
          fishing_position_cny: 0,
          fishing_position_thb: 0,
          fishing_position_usdt: 0,
          fruit_position_usd: 0,
          fruit_position_hkd: 0,
          fruit_position_eur: 0,
          fruit_position_cny: 0,
          fruit_position_thb: 0,
          fruit_position_usdt: 0,
          vegetable_position_usd: 0,
          vegetable_position_hkd: 0,
          vegetable_position_eur: 0,
          vegetable_position_cny: 0,
          vegetable_position_thb: 0,
          vegetable_position_usdt: 0,
          hunting_position_usd: 0,
          hunting_position_hkd: 0,
          hunting_position_eur: 0,
          hunting_position_cny: 0,
          hunting_position_thb: 0,
          hunting_position_usdt: 0,
          ecology_position_usd: 0,
          ecology_position_hkd: 0,
          ecology_position_eur: 0,
          ecology_position_cny: 0,
          ecology_position_thb: 0,
          ecology_position_usdt: 0,
          pie_position_usd: 0,
          pie_position_hkd: 0,
          pie_position_eur: 0,
          pie_position_cny: 0,
          pie_position_thb: 0,
          pie_position_usdt: 0,
        }
        for(const position of positions) {
          const positionCurrency = position.currencyId;
          if(positionCurrency === 1) {
            positionsStatistics.fishing_position_usd += position.amount;
          } else if(positionCurrency === 2) {
            positionsStatistics.fishing_position_hkd += position.amount;
          } else if(positionCurrency === 3) {
            positionsStatistics.fishing_position_eur += position.amount;
          } else if(positionCurrency === 4) {
            positionsStatistics.fishing_position_cny += position.amount;
          } else if(positionCurrency === 5) {
            positionsStatistics.fishing_position_thb += position.amount;
          } else if(positionCurrency === 6) {
            positionsStatistics.fishing_position_usdt += position.amount;
          } 
        }
        // await this.assetsCurdService.createPositionsStatistics(positionsStatistics);

        assetsStatistics.user_id = user.id;
        // await this.assetsCurdService.createAssetsStatistics(assetsStatistics);
    }
  }
}
