import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/shared/constants';
import { AuthService } from './auth.service';

export interface AuthModuleOptions {
  jwtSecretKey: string;
}

@Module({})
@Global()
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        AuthService,
      ],
      exports: [AuthService],
    };
  }
}
