import { Controller, Get, Post, Body, Request, Query, Logger, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('change')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userid, changePasswordDto);
  }

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
  switchUser(@Request() req, @Query('userid') userid: string) {
    const mainUserid = req.user.sub;
    if(!userid) {
      throw new Error('Target Userid is required');
    }  
    return this.authService.switchUser(mainUserid, parseInt(userid));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToQiniu(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? file.buffer.length : 0
    });
    return this.authService.uploadToQiniu(file);
  }
}
