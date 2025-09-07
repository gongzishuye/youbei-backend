import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ConfigService } from '@nestjs/config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AdminService {
  constructor(private configService: ConfigService) {}

  changePassword(updateAdminDto: UpdateAdminDto) {
    
  }
}
