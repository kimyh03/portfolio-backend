import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './shared/auth/auth.module';
import { PostModule } from './post/post.module';
import { ApplicationModule } from './application/application.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './user/entities/user.entity';
import { Post } from './post/entities/post.entity';
import { Like } from './like/entities/like.entity';
import { Answer } from './comment/entities/answer.entity';
import { Question } from './comment/entities/question.entity';
import { Application } from './application/entities/application.entity';
import { Certificate } from './post/entities/certificate.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtMiddleware } from './shared/auth/auth.middleware';
import { S3Module } from './shared/S3/S3.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { RedisCacheModule } from './shared/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        HASH_ROUNDS: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.string().required(),
        CACHE_TTL: Joi.string().required(),
        NODE_ENV: Joi.valid('dev', 'test', 'prod'),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: process.env.NODE_ENV !== 'test',
      synchronize: true,
      entities: [User, Post, Like, Question, Answer, Application, Certificate],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    UserModule,
    AuthModule.forRoot({ jwtSecretKey: process.env.JWT_SECRET }),
    PostModule,
    ApplicationModule,
    S3Module,
    LikeModule,
    CommentModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
