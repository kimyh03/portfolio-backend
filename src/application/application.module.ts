import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationResolver } from './application.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Post])],
  providers: [ApplicationService, ApplicationResolver],
})
export class ApplicationModule {}
