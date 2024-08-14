import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '~/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockUserModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        job: 'Software Developer',
        email: 'john@example.com',
      };
      const savedUser = { id: '1', ...createUserDto };

      mockUserModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(savedUser),
      });

      const result = await service.create(createUserDto);
      expect(result).toEqual(savedUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw an error if user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        job: 'Software Developer',
        email: 'john@example.com',
      };

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
      const users = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          job: 'Software Developer',
          email: 'john@example.com',
        },
      ];

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
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        job: 'Software Developer',
        email: 'john@example.com',
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.findOne('1');
      expect(result).toEqual(user);
      expect(mockUserModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if retrieval fails', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to retrieve user')),
      });

      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const updateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        job: 'Product Manager',
        email: 'jane@example.com',
      };

      const user = { id: '1', ...updateUserDto };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual(user);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        updateUserDto,
        { new: true },
      );
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const updateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        job: 'Product Manager',
        email: 'jane@example.com',
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        updateUserDto,
        { new: true },
      );
    });

    it('should throw an InternalServerErrorException if update fails', async () => {
      const updateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        job: 'Product Manager',
        email: 'jane@example.com',
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to update user')),
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        updateUserDto,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        job: 'Software Developer',
        email: 'john@example.com',
      };

      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await service.delete('1');
      expect(result).toEqual(user);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if deletion fails', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Failed to delete user')),
      });

      await expect(service.delete('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
