import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from '../users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const userObject = {
    name: 'any_name',
    email: 'any_email@email.com',
  };

  const createUserQuery = () => {
    return `
    mutation {
      createUser(createUserData: {name: "${userObject.name}", email: "${userObject.email}"}) {
        _id
        email
        name
      }
    }`;
  };

  const getUserQuery = () => {
    return `
      query {
        getUsers {
          _id
          email
          name
        }
      }
    `;
  };

  const updateUserQuery = (userId, newName) => {
    return `
      mutation {
        updateUser(id: "${userId}", updateUserData: { name: "${newName}" }) {
        _id
        email
        name
      }
    }
    `;
  };

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          autoSchemaFile: true,
        }),
        UsersModule,
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    if (mongoose) await mongoose.disconnect();
    await mongod.stop();
  });

  it('should create a user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createUserQuery(),
      })
      .expect(({ body }) => {
        const data = body.data.createUser;
        expect(data.name).toBe(userObject.name);
        expect(data.email).toBe(userObject.email);
      })
      .expect(200);
  });

  it('should get a user', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: getUserQuery(),
      })
      .expect(({ body }) => {
        expect(body.data.getUsers.length).toBe(0);
      })
      .expect(200);
  });

  it('should get two users', async () => {
    await request(app.getHttpServer()).post('/graphql').send({
      query: createUserQuery(),
    });
    await request(app.getHttpServer()).post('/graphql').send({
      query: createUserQuery(),
    });

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: getUserQuery(),
      })
      .expect(({ body }) => {
        expect(body.data.getUsers.length).toBe(2);
      })
      .expect(200);
  });

  it('should modify user name', async () => {
    const result = await request(app.getHttpServer()).post('/graphql').send({
      query: createUserQuery(),
    });

    const { _id, name } = result.body.data.createUser;
    const newName = name + '_new_name';

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: updateUserQuery(_id, newName),
      })
      .expect(({ body }) => {
        expect(newName).toBe(body.data.updateUser.name);
      })
      .expect(200);
  });
});
