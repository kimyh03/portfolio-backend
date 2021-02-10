import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ApplicationModule } from './application/application.module';
import { CertificateModule } from './certificate/certificate.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './user/entities/user.entity';
import { Post } from './post/entities/post.entity';
import { Like } from './post/entities/like.entity';
import { Answer } from './post/entities/answer.entity';
import { Question } from './post/entities/question.entity';
import { Application } from './application/entities/application.entity';
import { Certificate } from './certificate/entities/certificate.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        HASH_ROUNDS: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: true,
      synchronize: true,
      entities: [User, Post, Like, Question, Answer, Application, Certificate],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    UserModule,
    AuthModule.forRoot({ jwtSecretKey: 'secret' }),
    PostModule,
    ApplicationModule,
    CertificateModule,
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
