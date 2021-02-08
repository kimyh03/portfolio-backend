import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationResolver } from './application.resolver';

@Module({
  providers: [ApplicationService, ApplicationResolver]
})
export class ApplicationModule {}
