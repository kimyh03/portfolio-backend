import { Module } from '@nestjs/common';
import { S3Controller } from './S3.controller';
import { S3Service } from './S3.service';

@Module({
  providers: [S3Service],
  controllers: [S3Controller],
})
export class S3Module {}
