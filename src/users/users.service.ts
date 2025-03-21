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

  async findAll(): Promise<Users[]> {
    return await this.usersRepository.find();
  }

  async createAccount(phone: string, name?: string, nickname?: string): Promise<Users> {
    const newUser = this.usersRepository.create({
      name: name || phone,
      nickname,
      phone,
      is_mainuser: true, // Default value, adjust as necessary
    });

    return await this.usersRepository.save(newUser); // Save the new user to the database
  }

  async createSubAccount(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({
      id: userId
    });
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
  }

  async deleteSubAccount(userId: number, subAccountId: number) {
    const user = await this.usersRepository.findOneBy({
      id: subAccountId
    });
    if (!user) {
      throw new Error('User not found');
    }
    if(user.main_userid !== userId) {
      throw new Error('Userid is not the sub account');
    }
    // delete all assets of the sub account
    await this.usersRepository.delete(subAccountId);
  }
}