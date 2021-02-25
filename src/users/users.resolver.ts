import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user-input';
import { UpdateUserInput } from './dto/update-user-input';
import { AuthGuard } from './auth.guard';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Token } from './models/token.model';
import { LoginInput } from './dto/login-input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => User, { name: 'me' })
  @UseGuards(new AuthGuard())
  me(@Context('user') user: User) {
    return user;
  }

  @Mutation(() => Token)
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.usersService.getUserByEmail(loginInput.email);
    if (!user) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
    return { token: this.usersService.createToken(user) };
  }

  @Query(() => [User], { name: 'getUsers', nullable: 'items' })
  async getUsers(): Promise<User[]> {
    return await this.usersService.getUsers();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser(createUserData);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: string,
    @Args('updateUserData') updateUserData: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserData);
  }

  @Query(() => User, { name: 'getUser' })
  async getUser(@Args('email') email: string): Promise<User> {
    return await this.usersService.getUserByEmail(email);
  }
}
