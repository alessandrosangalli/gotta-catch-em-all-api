import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/input/create-user-input';
import { UpdateUserInput } from './dto/input/update-user-input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [User], { name: 'getUsers', nullable: 'items' })
  getUsers(): User[] {
    return this.usersService.getUsers();
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
