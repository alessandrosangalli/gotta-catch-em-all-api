import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user';
import { UsersService } from './users.service';
import { GetUserArgs } from './dto/args/get-user-args';
import { CreateUserInput } from './dto/input/create-user-input';
import { UpdateUserInput } from './dto/input/update-user-input';
import { GetUsersArgs } from './dto/args/get-users-args';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => User, { name: 'user', nullable: true })
  getUser(@Args() getUserArgs: GetUserArgs): User {
    return this.usersService.getUser(getUserArgs);
  }

  @Query(() => [User], { name: 'users', nullable: 'items' })
  getUsers(@Args() getUserArgs: GetUsersArgs): User[] {
    return this.usersService.getUsers(getUserArgs);
  }

  @Mutation(() => User)
  createUser(@Args('createUserData') createUserData: CreateUserInput): User {
    return this.usersService.createUser(createUserData);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserData') updateUserData: UpdateUserInput): User {
    return this.usersService.updateUser(updateUserData);
  }
}
