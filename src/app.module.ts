import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '27017';

const url = `mongodb://${HOST}:${PORT}/gotta-catch-em-all`;

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    UsersModule,
    MongooseModule.forRoot(url),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
