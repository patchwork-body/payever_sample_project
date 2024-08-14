import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockReturnValue('mongodb://localhost/test'),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
  });

  it('should provide MongooseModule', () => {
    const mongooseModule = module.get(MongooseModule);
    expect(mongooseModule).toBeDefined();
  });

  it('should provide CacheModule', () => {
    const cacheModule = module.get(CacheModule);
    expect(cacheModule).toBeDefined();
  });

  it('should provide ThrottlerModule', () => {
    const throttlerModule = module.get(ThrottlerModule);
    expect(throttlerModule).toBeDefined();
  });

  it('should import UsersModule', () => {
    const usersModule = module.get(UsersModule);
    expect(usersModule).toBeDefined();
  });
});
