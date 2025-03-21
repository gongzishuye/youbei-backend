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
  sendSms(@Query('phone') phone) {
    console.log('start to send sms', phone);
    return this.authService.sendSms(phone);
  }

  @Post('switch')
  switchUser(@Request() req, @Body('userid') userid: number) {
    const mainUserid = req.user.id;
    return this.authService.switchUser(mainUserid, userid);
  }
}
