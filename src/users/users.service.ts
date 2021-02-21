import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user-input';
import { User } from '../users/interfaces/user.interface';
import { UpdateUserInput } from './dto/update-user-input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) { }
  private users: User[] = [];

  public async createUser(createUserData: CreateUserInput): Promise<User> {
    const createdUser = new this.userModel(createUserData);
    return await createdUser.save();
  }

  public async updateUser(
    id: string,
    updateUserData: UpdateUserInput,
  ): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { _id: id },
      {
        ...updateUserData,
      },
      { new: true },
    );
  }

  public async getUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  public async getUser(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }
}
