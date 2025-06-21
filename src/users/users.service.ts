import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {

  constructor(@InjectRepository(Users) private usersRepository: Repository<Users>) {}

  async findOne(phone?: string, name?: string): Promise<Users | undefined> {
    const query = this.usersRepository.createQueryBuilder('users');

    if (phone) {
      query.andWhere('users.phone = :phone', { phone });
    }

    if (name) {
      query.andWhere('users.name = :name', { name });
    }

    return await query.getOne(); // Get the user based on the constructed query
  }

  async findUser(userid: number): Promise<Users> {
    return await this.usersRepository.findOneBy({
      id: userid
    });
  }

  async findUsersByMainUserid(mainUserid: number): Promise<Users[]> {
    return await this.usersRepository.find({
      where: {
        mainUserid: mainUserid
      }
    });
  }

  async findUserCount() {
    return await this.usersRepository.count();
  }

  async findAll(): Promise<Users[]> {
    return await this.usersRepository.find();
  }

  async createAccount(phone?: string, name?: string, nickname?: string, password?: string): Promise<Users> {
    if(!name) {
      const userCount = await this.findUserCount();
      name = `有贝用户${userCount + 1}`;
      console.log('new user name', name);
    }
    const newUser = this.usersRepository.create({
      name: name,
      nickname,
      phone,
      password,
      isMainuser: 1, // Default value, adjust as necessary
    });

    const userEntity = await this.usersRepository.save(newUser); // Save the new user to the database
    userEntity.mainUserid = userEntity.id;
    return await this.usersRepository.save(userEntity);
  }

  async createSubAccount(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    return this.findUsers(createUserDto.mainUserid);
  }

  async updateUser(mainUserid: number, userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({
      id: userId
    });
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    await this.usersRepository.save(updatedUser);
    return this.findUsers(mainUserid);
  }

  async deleteSubAccount(userId: number) {
    const user = await this.usersRepository.findOneBy({
      id: userId
    });
    if (!user) {
      throw new Error('User not found');
    }
    if(user.isMainuser) {
      throw new Error('Userid is not the sub account');
    }
    // delete all assets of the sub account
    await this.usersRepository.delete({
      id: userId
    });
    return this.findUsers(user.mainUserid);
  }

  /// find user by main userid
  async findUsers(mainUserid: number) {
    const users = await this.findUsersByMainUserid(mainUserid);
    const main = users.filter(user => user.isMainuser)[0];
    const sub = users.filter(user => !user.isMainuser);
    return {
      main,
      sub
    };
  }
}