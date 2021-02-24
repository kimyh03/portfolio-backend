import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Question } from 'src/comment/entities/question.entity';
import { Application } from 'src/application/entities/application.entity';
import { Like } from 'src/like/entities/like.entity';
import { Certificate } from 'src/post/entities/certificate.entity';
import { Answer } from 'src/comment/entities/answer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

let app: INestApplication;

let _user: Repository<User>;
let _post: Repository<Post>;
let _question: Repository<Question>;
let _answer: Repository<Answer>;
let _application: Repository<Application>;
let _like: Repository<Like>;
let _certificate: Repository<Certificate>;

const testUser = {
  username: 'Hoony',
  email: 'Hoony@hoony.com',
  password: '123',
};

let fakeJwt: string;
let jwt: string;

describe('AppController (e2e)', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    _user = module.get(getRepositoryToken(User));
    _post = module.get(getRepositoryToken(Post));
    _question = module.get(getRepositoryToken(Question));
    _answer = module.get(getRepositoryToken(Answer));
    _application = module.get(getRepositoryToken(Application));
    _like = module.get(getRepositoryToken(Like));
    _certificate = module.get(getRepositoryToken(Certificate));
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('signUp', () => {
    it('sign up to get a fake jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            signUp(input:{
              username:"fake",
              email:"fake@fake.com",
              password:"fake",
            }){
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          fakeJwt = res.body.data.signUp.token;
        });
    });
    it('should sign up (create user)', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              signUp(input:{
                username:"${testUser.username}",
                email:"${testUser.email}",
                password:"${testUser.password}",
              }){
                ok
                error
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                signUp: { ok, error, token },
              },
            },
          } = res;
          jwt = token;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(token).toEqual(expect.any(String));
        });
    });
    it('should fail with exist email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              signUp(input:{
                username:"test",
                email:"${testUser.email}",
                password:"test",
              }){
                ok
                error
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                signUp: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(token).toBe(null);
        });
    });
  });
});
