import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { Like } from 'src/post/entities/like.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Like, Application])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
