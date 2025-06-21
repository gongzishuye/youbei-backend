import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AssetsService } from 'src/assets/assets.service';
import { UsersService } from 'src/users/users.service';
import { ContentService } from 'src/contents/content.service';

@Injectable()
export class TasksAssetService {
  private readonly logger = new Logger(TasksAssetService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly assetsService: AssetsService,
    private readonly contentService: ContentService,
  ) {}

  @Cron('0 0 0 * * *')
  async runCreateAssetsSnapshot() {
    this.logger.log(`runCreateAssetsSnapshot`);
    this.assetsService.createAssetsSnapshot();
  }

  // sync every 4 hours
  @Cron('0 0 */4 * * *')
  async runUpdateAssets() {
    this.logger.log(`runUpdateAssets`);
    // this.assetsService.updateLocolAssets(true);
    this.assetsService.updateLocolAssets(false);
    this.assetsService.updateLocalCurrencies();
  }

  @Cron('0 0 * * * *')
  async runStatistics() {
    this.logger.log(`runStatistics`);
    const users = await this.usersService.findAll();
    for(const user of users) {
      this.logger.log(`runStatistics for user ${user.id}`);
      await this.assetsService.updateStatistics(user.id);
    }
  }

  @Cron('0 0 */6 * * *')
  async runCreatePnl() {
    this.logger.log(`runCreatePnl`);
    const users = await this.usersService.findAll();
    for(const user of users) {
      this.logger.log(`runCreatePnl for user ${user.id}`);
      await this.assetsService.createPnl(user.id);
    }
  }

  // 每天凌晨0点触发
  @Cron('0 30 0 * * *')
  async runCreateBanner() {
    this.logger.log(`runCreateBanner`);
    const users = await this.usersService.findAll();
    for(const user of users) {
      this.logger.log(`runCreateBanner for user ${user.id}`);
      await this.assetsService.createSummary(user.id);
      await this.contentService.triggerContent(user.id);
    }
  }
}
