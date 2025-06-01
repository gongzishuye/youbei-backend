import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TasksService, VikaRecord } from './tasks.service';
import { SnapshotService } from './tasks.snapshot';
import { tasksConfig } from './tasks.config';
import { Public } from 'src/auth/constants';
import { TasksAssetService } from './tasks.assetservice';
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly snapshotService: SnapshotService,
    private readonly tasksAssetService: TasksAssetService,
  ) {}

  @Public()
  @Get('/vika/datasheet')
  async updateDatasheet(@Query('datasheetid') datasheetid: string) {
    if (!datasheetid) {
      throw new Error('datasheetid is required');
    }
    // 从参数里获取datasheetId
    const datasheets = tasksConfig[datasheetid].datasheets;
    await this.tasksService.readVikaMultiPools(datasheets);
    return this.snapshotService.readSnapshot(datasheets);
  }

  @Public()
  @Get('multipools')
  async readVikaMultiPools(@Query('datasheetid') datasheetid: string) {
    if (!datasheetid) {
      throw new Error('datasheetid is required');
    }
    // 从参数里获取datasheetId
    const datasheets = tasksConfig[datasheetid].datasheets;
    const records: VikaRecord[] = await this.tasksService.readVikaMultiPools(datasheets);
    return records;
  }

  @Public()
  @Get('snapshot')
  async readSnapshot(@Query('datasheetid') datasheetid: string) {
    if (!datasheetid) {
      throw new Error('datasheetid is required');
    }
    const datasheets = tasksConfig[datasheetid].datasheets;
    return this.snapshotService.readSnapshot(datasheets);
  }

  @Get('snapshot/query')
  async readSnapshotQuery() {
    const data = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit', 
      timeZone: 'Asia/Shanghai'
    }).split(' ')[0].replace(/\//g, '-');
    console.log(data);
    return await this.snapshotService.vika_query(this.snapshotService.vikaConnectorAssetSnapshot, new Date(data).getTime());
  }

  @Public()
  @Get('assets/update')
  async runUpdateAssets() {
    await this.tasksAssetService.runUpdateAssets();
  }
}
