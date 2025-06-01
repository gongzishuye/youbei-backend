import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('verify')
  verify(@Body('phone') phone, @Body('code') code) {
    return this.authService.verifyCode(phone, code);
  }

  @Public()
  @Get('send')
  sendSms(@Query('phone') phone: string) {
    console.log('start to send sms', phone);
    return this.authService.sendSms(phone);
  }

  @Get('switch')
  switchUser(@Request() req, @Body('userid') userid: number) {
    const mainUserid = req.user.userid;
    return this.authService.switchUser(mainUserid, userid);
  }

  @Get('qiniutoken')
  async getQiniuToken() {
    const token = await this.authService.getQiniuToken();
    console.log('qiniu token', token);
    return {
      token: token,
    }
  }
}
