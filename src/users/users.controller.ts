import { Controller, Get, Request, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}
    // 获取用户信息
    @Get('user')
    async getUser(@Request() req: any) {
        const mainUserid = req.user?.sub;
        const userid = req.user?.userid;
        console.log('mainUserid', mainUserid);
        const users = await this.usersService.findUsers(mainUserid);
        console.log(users);
        const result = {
            ...users,
            currentUserid: userid
        }
        console.log('result', result);
        return result;
    }

    // 更新用户信息
    @Post('user')
    async updateUser(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        const userid = req.user.userid;
        const mainUserid = req.user.sub;
        const users = await this.usersService.updateUser(mainUserid, userid, updateUserDto);
        return {
            ...users,
            currentUserid: userid
        }
    }

    @Post('sub')
    async createSubAccount(@Request() req: any, @Body() createUserDto: CreateUserDto) {
        const userid = req.user.sub;
        createUserDto.mainUserid = userid;
        createUserDto.isMainuser = 0;
        const users = await this.usersService.createSubAccount(createUserDto);
        return {
            ...users,
            currentUserid: userid
        }
    }

    // delete sub account
    @Post('sub/delete')
    async deleteSubAccount(@Request() req: any, @Body('userid') toDeleteUserid: string) {
        console.log('toDeleteUserid', toDeleteUserid);
        const userid = req.user.userid;

        const users = await this.usersService.deleteSubAccount(parseInt(toDeleteUserid));
        return {
            ...users,
            currentUserid: userid
        }
    }
}
