import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AssetsModule } from 'src/assets/assets.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    ConfigModule,
    AssetsModule,
    UsersModule,
    AuthModule
  ]
})
export class AdminModule {}
