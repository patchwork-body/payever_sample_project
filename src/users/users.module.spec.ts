import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '~/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

describe('UsersModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        UsersModule,
        MongooseModule.forRoot('mongodb://localhost/test'),
      ],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(jest.fn())
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UsersService', () => {
    const usersService = module.get<UsersService>(UsersService);
    expect(usersService).toBeDefined();
  });

  it('should provide UsersController', () => {
    const usersController = module.get<UsersController>(UsersController);
    expect(usersController).toBeDefined();
  });

  it('should provide UserModel', () => {
    const userModel = module.get(getModelToken(User.name));
    expect(userModel).toBeDefined();
  });
});
