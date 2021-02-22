import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } from '../constants';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}
  getS3() {
    return new S3({
      accessKeyId: this.configService.get(AWS_ACCESS_KEY),
      secretAccessKey: this.configService.get(AWS_SECRET_ACCESS_KEY),
      region: 'ap-northeast-2',
    });
  }

  getUploadParams(file) {
    const bucket = 'hoony-portfolio';
    const { buffer, originalname } = file;
    const date = Date.now().toString();
    const key = `avatar/${date + originalname}`;
    return {
      ACL: 'public-read',
      Bucket: bucket,
      Key: key,
      Body: buffer,
    };
  }

  async upload(file) {
    try {
      const s3 = this.getS3();
      const params = this.getUploadParams(file);
      await s3.putObject(params).promise();
      return params.Key;
    } catch (error) {
      console.log(error.message);
    }
  }

  async delete(key: string) {
    try {
      const s3 = this.getS3();
      const params = {
        Bucket: 'hoony-portfolio',
        Key: `avatar${key}`,
      };
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.log(error.message);
    }
  }
}
