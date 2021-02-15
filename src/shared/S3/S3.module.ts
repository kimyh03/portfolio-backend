import { Global, Module } from '@nestjs/common';
import { S3Controller } from './S3.controller';
import { S3Service } from './S3.service';

@Global()
@Module({
  providers: [S3Service],
  controllers: [S3Controller],
  exports: [S3Service],
})
export class S3Module {}
