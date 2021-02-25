import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user-input';
import { User } from '../users/interfaces/user.interface';
import { UpdateUserInput } from './dto/update-user-input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) { }
  private users: User[] = [];

  public async createUser(createUserData: CreateUserInput): Promise<User> {
    createUserData.password = '12'; //await bcrypt.hash(createUserData.password, 10);
    const createdUser = new this.userModel(createUserData);
    return await createdUser.save();
  }

  createToken({ id, email }: User) {
    return jwt.sign({ id, email }, 'secret');
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

  public async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async findByPayload(payload: any) {
    const { email } = payload;
    return await this.getUserByEmail(email);
  }
}
