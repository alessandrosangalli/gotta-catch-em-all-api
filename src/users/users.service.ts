import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/input/create-user-input';
import { User } from './models/user';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserInput } from './dto/input/update-user-input';

@Injectable()
export class UsersService {
  private users: User[] = [];

  public createUser(createUserData: CreateUserInput): User {
    const user: User = {
      userId: uuidv4(),
      ...createUserData,
    };

    this.users.push(user);

    return user;
  }

  public updateUser(updateUserData: UpdateUserInput): User {
    const user = this.users.find(
      (user) => user.userId === updateUserData.userId,
    );

    Object.assign(user, updateUserData);

    return user;
  }

  public getUsers(): User[] {
    return this.users;
  }
}
