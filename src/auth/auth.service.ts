import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as OpenApi from '@alicloud/openapi-client';
import dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  createClient() {
    const apiConfig = new OpenApi.Config({
      accessKeyId: this.configService.get('SMS_KEY'),
      accessKeySecret: this.configService.get('SMS_SECRET'),
    });

    apiConfig.endpoint = 'dysmsapi.aliyuncs.com';

    return new dysmsapi(apiConfig);
  }

  async sendSms(phone: string) {
    // 随机生成6位数字作为手机验证码，首位数字可以是0
    const code = Math.floor(Math.random() * 1000000)
      .toString().padStart(6, '0');
    
    // 将验证码存储到redis中，过期时间为10分钟
    const result = await this.cacheManager.set(phone, code, 10 * 60 * 1000);
    console.log('phone', phone, 'code', code, 'result', result);

    // 立即验证是否存储成功
    const savedCode = await this.cacheManager.get(phone);
    console.log(this.cacheManager);
    const ttl = await this.cacheManager.ttl(phone);
    console.log('Verification - Saved code:', savedCode, 'ttl', ttl);
    
    if (!savedCode) {
      throw new Error('Failed to save code to cache');
    }
    
    // const client = this.createClient();
    // const res = await client.sendSms(
    //   new SendSmsRequest({
    //       phoneNumbers: `${phone}`,
    //       signName: '有贝',
    //       templateCode: 'SMS_478530563',
    //       templateParam: `{"code":"${code}"}`
    //   })
    // );
    // console.log(res);
    return {'code': code};
  }

  async verifyCode(phone: string, code: string) {
    // 从redis中获取验证码
    const cachedCode = await this.cacheManager.get(phone);
    console.log('cachedCode', cachedCode, 'code', code);
    if (cachedCode === code) {
      let user = await this.usersService.findOne(phone);
      if (!user) {
        user = await this.usersService.createAccount(
          phone
        );
      }
      console.log(`create new user with id: ${user.id}`);
      const payload = { sub: user.id, userid: user.id  };
      return {
        bearer: await this.jwtService.signAsync(payload),
      };
    }

    return {
      result: '验证码错误或者已经过期'
    }
  }

  async switchUser(mainUserid: number, subuserid: number) {
    const user = await this.usersService.findUser(subuserid);
    if (!user) {
      throw new Error('Sub User not found');
    }
    const payload = { sub: mainUserid, userid: subuserid  };
    return {
      bearer: await this.jwtService.signAsync(payload),
    };
  }
}
