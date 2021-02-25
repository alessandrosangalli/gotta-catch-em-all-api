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
    password: 'any_password',
  };

  const createUserQuery = () => {
    return `
    mutation {
      createUser(createUserData: {name: "${userObject.name}", email: "${userObject.email}", password: "${userObject.password}"}) {
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

  const loginQuery = () => {
    return `
      mutation {
        login (loginInput: { email: "${userObject.email}", password: "${userObject.password}"}) {
          token
        }
      }
    `;
  };

  const authorizeQuery = () => {
    return `query {
      me {
        email
      }
    }`;
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

  it('should create a user', async () => {
    return await request(app.getHttpServer())
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

  it('should get a user', async () => {
    return await request(app.getHttpServer())
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
    userObject.email += '_';
    await request(app.getHttpServer()).post('/graphql').send({
      query: createUserQuery(),
    });

    return await request(app.getHttpServer())
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

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: updateUserQuery(_id, newName),
      })
      .expect(({ body }) => {
        expect(newName).toBe(body.data.updateUser.name);
      })
      .expect(200);
  });

  it('should login and authorize token', async () => {
    await request(app.getHttpServer()).post('/graphql').send({
      query: createUserQuery(),
    });

    const loginBody = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: loginQuery(),
      })
      .expect(200);

    const token = loginBody.body.data.login.token;

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    return await request(app.getHttpServer())
      .post('/graphql')
      .set({ authorization: `Bearer ${token}` })
      .send({
        query: authorizeQuery(),
      })
      .expect(({ body }) => {
        expect(body.data.me.email).toBe(userObject.email);
      })
      .expect(200);
  });
});
