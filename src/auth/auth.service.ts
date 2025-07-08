import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as OpenApi from '@alicloud/openapi-client';
import dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as qiniu from 'qiniu';
import { Multer } from 'multer';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(undefined, registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user
    const user = await this.usersService.createAccount(
      undefined, // phone
      registerDto.username,
      registerDto.nickname,
      hashedPassword
    );

    // Generate JWT token
    const payload = { sub: user.mainUserid, userid: user.id };
    return {
      status: 0,
      bearer: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`loginDto: ${JSON.stringify(loginDto)}`);
    // Find user by username
    const user = await this.usersService.findOne(undefined, loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.mainUserid, userid: user.id };
    return {
      status: 0,
      bearer: await this.jwtService.signAsync(payload),
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // Find user
    const user = await this.usersService.findUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.usersService.updateUser(user.mainUserid, userId, { 
      password: hashedNewPassword,
      id: userId
    });

    return {
      status: 0,
      message: 'Password updated successfully'
    };
  }

  createClient() {
    const apiConfig = new OpenApi.Config({
      accessKeyId: this.configService.get('SMS_KEY'),
      accessKeySecret: this.configService.get('SMS_SECRET'),
    });

    apiConfig.endpoint = 'dysmsapi.aliyuncs.com';

    return new dysmsapi(apiConfig);
  }

  async sendSms(phone: string) {
    const savedCode = await this.cacheManager.get(phone);

    if(savedCode) {
      return {'code': -1};
    }

    if(phone) {
      const code = '666666';
      const result = await this.cacheManager.set(phone, code, 10 * 60 * 1000);
      console.log('phone', phone, 'code', code, 'result', result);

      const savedCode = await this.cacheManager.get(phone);
      console.log(this.cacheManager);
      const ttl = await this.cacheManager.ttl(phone);
      console.log('Verification - Saved code:', savedCode, 'ttl', ttl);
      
      if (!savedCode) {
        throw new Error('Failed to save code to cache');
      }
    }
    return {'code': 200};
  }

  async verifyCode(phone: string, code: string) {
    const cachedCode = await this.cacheManager.get(phone);
    console.log('cachedCode', cachedCode, 'code', code);
    if(!cachedCode) {
      return {
        status: 2 // 验证码已过期
      }
    }
    if (cachedCode === code) {
      let user = await this.usersService.findOne(phone);
      if (!user) {
        user = await this.usersService.createAccount(
          phone
        );
      }
      console.log(`create new user with id: ${user.id}`);
      const payload = { sub: user.mainUserid, userid: user.id  };
      return {
        status: 0,
        bearer: await this.jwtService.signAsync(payload),
      };
    }

    return {
      status: 1 // 验证码错误
    }
  }

  async switchUser(mainUserid: number, toUserid: number) {
    const user = await this.usersService.findUser(toUserid);
    if (!user) {
      throw new Error('Target User not found');
    }
    const payload = { sub: mainUserid, userid: toUserid  };
    console.log('switchUser payload', payload);
    return {
      bearer: await this.jwtService.signAsync(payload),
    };
  }

  async uploadToQiniu(file: any) {
    const accessKey = this.configService.get('AK');
    const secretKey = this.configService.get('SK');
    const bucket = this.configService.get('QINIU_BUCKET');
    const domain = this.configService.get('QINIU_DOMAIN');

    if (!accessKey || !secretKey || !bucket || !domain) {
      throw new Error('Qiniu configuration is missing');
    }

    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket,
      fsizeLimit: 10 * 1024 * 1024, // 10MB
    });
    const uploadToken = putPolicy.uploadToken(mac);

    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2; // 华南
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.put(uploadToken, file.originalname, file.buffer, putExtra, (respErr, respBody, respInfo) => {
        if (respErr) {
          console.error('Upload error:', respErr);
          reject(respErr);
        }
        if (respInfo.statusCode === 200) {
          resolve({
            url: `${domain}/${respBody.key}`,
            key: respBody.key
          });
        } else {
          console.error('Upload failed:', {
            statusCode: respInfo.statusCode,
            body: respBody,
            error: respErr
          });
          reject(new Error(`Upload failed with status code: ${respInfo.statusCode}, body: ${JSON.stringify(respBody)}`));
        }
      });
    });
  }

  async hashPassword(input: string): Promise<string> {
    const hashedPassword = await bcrypt.hash('6bcd7e6f0af886423292e24fbb20112256ebfdcf719adf289fb1fe8787fdeab9', 10);
    return hashedPassword;
  }
}
