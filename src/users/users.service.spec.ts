import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '~/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { UserDto } from './dtos/user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

const mockUserModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'REQRES_API_URL':
        return 'https://reqres.in';
      default:
        return null;
    }
  }),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const userDto: UserDto = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    job: 'Software Developer',
    email: 'john@example.com',
  };

  const createUserDto: CreateUserDto = {
    first_name: 'John',
    last_name: 'Doe',
    job: 'Software Developer',
    email: 'john@example.com',
  };

  let updateUserDto: UpdateUserDto = {
    first_name: 'Jane',
    last_name: 'Doe',
    job: 'Product Manager',
    email: 'jane@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot()],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockReturnValue(of({ data: userDto })),
        post: jest.fn().mockReturnValue(of({ data: userDto })),
      })
      .compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(userDto),
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual(userDto);
      expect(mockUserModel.create).toHaveBeenCalledWith(userDto);
    });

    it('should throw an error if user creation fails', async () => {
      mockUserModel.create.mockReturnValue({
        save: jest.fn().mockRejectedValue(new Error('Failed to create user')),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [userDto];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(users),
      });

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should throw an error if retrieval fails', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(new Error('Failed to retrieve users')),
      });

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userDto),
      });

      let id = new ObjectId().toString();

      const result = await service.findOne(id);
      expect(result).toEqual(userDto);
      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      let id = new ObjectId().toString();

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if retrieval fails', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to retrieve user')),
      });

      let id = new ObjectId().toString();

      await expect(service.findOne(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      let id = new ObjectId().toString();
      const user = { id, ...updateUserDto };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.update(id, updateUserDto);

      expect(result).toEqual(user);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateUserDto,
        { new: true },
      );
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      let id = new ObjectId().toString();

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateUserDto,
        { new: true },
      );
    });

    it('should throw an InternalServerErrorException if update fails', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to update user')),
      });

      let id = new ObjectId().toString();

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateUserDto,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userDto),
      });

      const result = await service.delete('507f1f77bcf86cd799439011');
      expect(result).toEqual(userDto);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if deletion fails', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to delete user')),
      });

      await expect(service.delete('507f1f77bcf86cd799439011')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
