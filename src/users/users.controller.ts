import { Controller, Get, Request, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}
    // 获取用户信息
    @Get()
    getUser(@Request() req) {
        const userid = req.user.userid;
        return this.usersService.findUser(userid);
    }

    @Post('sub')
    createSubAccount(@Request() req, @Body() createUserDto: CreateUserDto) {
        const userid = req.user.sub;
        createUserDto.main_userid = userid;
        createUserDto.is_mainuser = false;
        return this.usersService.createSubAccount(createUserDto);
    }

    // 更新用户信息
    @Post('update')
    updateUser(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        const userid = req.user.userid;
        return this.usersService.updateUser(userid, updateUserDto);
    }

    // delete sub account
    @Post('sub/:id')
    deleteSubAccount(@Request() req, @Param('id') id: string) {
        return this.usersService.deleteSubAccount(req.user.id, parseInt(id));
    }
}
