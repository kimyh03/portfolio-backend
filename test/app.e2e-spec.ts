import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import {
  Post,
  postCategoryEnum,
  postRigionEnum,
} from 'src/post/entities/post.entity';
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
const testPost = {
  title: 'test',
  description: 'test',
  category: postCategoryEnum.communityService,
  rigion: postRigionEnum.Seoul,
  adress: 'test',
  host: 'test',
  NumOfRecruitment: 1,
  recognizedHours: 1,
  date: '2020.11.11',
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

  describe('signIn', () => {
    it('should log in', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            signIn(input:{
              email:"${testUser.email}",
              password:"${testUser.password}"
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
                signIn: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(token).toEqual(expect.any(String));
        });
    });
    it('should fail with wrong email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            signIn(input:{
              email:"test",
              password:"${testUser.password}",
            }){
              ok
              error
              token
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                signIn: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(token).toBe(null);
        });
    });
    it('should fail with wrong password', () => {
      request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            signIn(input:{
              email:"${testUser.email}",
              password:"test"
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
                signIn: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(token).toBe(null);
        });
    });
  });

  describe('getProfile', () => {
    let user: User;
    beforeAll(async () => {
      user = await _user.findOne({
        email: testUser.email,
      });
    });
    it('should fail with notFound userId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
            getProfile(input:{userId:666}){
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should get my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `{
            getProfile(input:{userId:${user.id}}){
              ok
              error
              isSelf
              user{
                id
              }
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getProfile: { ok, error, isSelf, user },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(isSelf).toBe(true);
          expect(user).toEqual(expect.any(Object));
        });
    });
    it('should get others profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
            getProfile(input:{userId:${user.id}}){
              ok
              error
              isSelf
              user{
                id
              }
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getProfile: { ok, error, isSelf, user },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(isSelf).toBe(false);
          expect(user).toEqual(expect.any(Object));
        });
    });
  });

  describe('createPost', () => {
    it('should fail without jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              createPost(input:{
                title: "${testPost.title}",
                description: "${testPost.description}",
                category: ${testPost.category},
                rigion: ${testPost.rigion},
                adress: "${testPost.adress}",
                host: "${testPost.host}",
                NumOfRecruitment: ${testPost.NumOfRecruitment},
                recognizedHours: ${testPost.recognizedHours},
                date: "${testPost.date}"
              }){
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
    it('should create post', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
            mutation{
              createPost(input:{
                title: "${testPost.title}",
                description: "${testPost.description}",
                category: ${testPost.category},
                rigion: ${testPost.rigion},
                adress: "${testPost.adress}",
                host: "${testPost.host}",
                NumOfRecruitment: ${testPost.NumOfRecruitment},
                recognizedHours: ${testPost.recognizedHours},
                date: "${testPost.date}"
              }){
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createPost: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('getPostDetail', () => {
    let post: Post;
    beforeAll(async () => {
      post = await _post.findOne({ where: { title: testPost.title } });
    });
    it('should get post detail', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
            getPostDetail(input:{postId:${post.id}}){
              ok
              error
              post{
                id
              }
              isMine
              isLiked
              isApplied
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getPostDetail: { ok, error, post, isMine, isLiked, isApplied },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(post).toEqual(expect.any(Object));
          expect(isMine).toBe(false);
          expect(isLiked).toBe(false);
          expect(isApplied).toBe(false);
        });
    });
    it('should fail with not found postId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
          getPostDetail(input:{postId:666}){
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getPostDetail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
  });

  describe('getPosts', () => {
    it('should get posts', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          {
            getPosts(input:{
              page:1, 
              openOnly:false, 
              categories:[], 
              rigions:[], 
              searchTerm:""}){
            ok
            error
            posts{
              id
            }
            totalCount
            totalPage
          }
        }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getPosts: { ok, error, posts, totalCount, totalPage },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(posts).toEqual(expect.any(Array));
          expect(totalCount).toBe(1);
          expect(totalPage).toBe(1);
        });
    });
  });

  describe('toggleLike', () => {
    let post: Post;
    beforeAll(async () => {
      post = await _post.findOne({ where: { title: testPost.title } });
    });
    it('should toggle like', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{toggleLike(input:{postId:${post.id}}){
            ok
            error
          }}`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                toggleLike: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail with notFound postId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{toggleLike(input:{postId:666}){
            ok
            error
          }}`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                toggleLike: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should fail without jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{toggleLike(input:{postId:${post.id}}){
            ok
            error
          }}`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
  });

  describe('createQuestion', () => {
    let post: Post;
    beforeAll(async () => {
      post = await _post.findOne({ where: { title: testPost.title } });
    });
    it('should create qeustion', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{createQuestion(input:{postId:${post.id}, text:"test"}){
            ok
            error
          }}
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createQuestion: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail with notFound postId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{createQuestion(input:{postId:666, text:"test"}){
            ok
            error
          }}
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createQuestion: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should fail without jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{createQuestion(input:{postId:${post.id}, text:"test"}){
            ok
            error
          }}
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
  });

  describe('createAnswer', () => {
    let question: Question;
    beforeAll(async () => {
      question = await _question.findOne(1);
    });
    it('should create answer', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{
            createAnswer(input:{questionId:${question.id}, text:"test"}){
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAnswer: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail with notFound questionId', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
          mutation{
            createAnswer(input:{questionId:666, text:"test"}){
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAnswer: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should fail with not author jwt', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${fakeJwt}` })
        .send({
          query: `
          mutation{
            createAnswer(input:{questionId:${question.id}, text:"test"}){
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAnswer: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
        });
    });
  });
});
