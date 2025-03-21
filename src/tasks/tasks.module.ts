import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SnapshotService } from './tasks.snapshot';

@Module({
  controllers: [TasksController],
  providers: [TasksService, SnapshotService]
})
export class TasksModule {}
