import { Module } from '@nestjs/common';
import { CertificateResolver } from './certificate.resolver';
import { CertificateService } from './certificate.service';

@Module({
  providers: [CertificateResolver, CertificateService]
})
export class CertificateModule {}
