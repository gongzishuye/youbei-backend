import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SnapshotService } from './tasks.snapshot';
import { TasksAssetService } from './tasks.assetservice';
import { UsersModule } from 'src/users/users.module';
import { AssetsModule } from 'src/assets/assets.module';
import { ContentModule } from 'src/contents/content.module';
@Module({
  controllers: [TasksController],
  providers: [TasksService, SnapshotService, TasksAssetService],
  imports: [UsersModule, AssetsModule, ContentModule]
})
export class TasksModule {}
