import { Controller, Get, Request, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}
    // 获取用户信息
    @Get('user')
    async getUser(@Request() req: any) {
        const userid = req.user?.userid;
        console.log('userid', userid);
        const users = await this.usersService.findUsers(userid);
        console.log(users);
        return users;
    }

    // 更新用户信息
    @Post('user')
    updateUser(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        const userid = req.user.userid;
        const mainUserid = req.user.sub;
        return this.usersService.updateUser(mainUserid, userid, updateUserDto);
    }

    @Post('sub')
    createSubAccount(@Request() req: any, @Body() createUserDto: CreateUserDto) {
        const userid = req.user.sub;
        createUserDto.mainUserid = userid;
        createUserDto.isMainuser = false;
        return this.usersService.createSubAccount(createUserDto);
    }

    // delete sub account
    @Post('sub/delete')
    deleteSubAccount(@Request() req: any, @Body('userid') userid: string) {
        console.log('userid', userid);
        return this.usersService.deleteSubAccount(parseInt(userid));
    }
}
