import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

const mockUsersService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot()],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockUsersService.create.mockResolvedValue(savedUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(savedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
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
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result).toEqual(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
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
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Doe',
          job: 'Product Manager',
          email: 'jane@example.com',
        },
      ];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no users are found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(mockUsersService.findAll).toHaveBeenCalled();
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
      mockUsersService.update.mockResolvedValue(user);

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(user);
      expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const updateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        job: 'Product Manager',
        email: 'jane@example.com',
      };
      mockUsersService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw an InternalServerErrorException if update fails', async () => {
      const updateUserDto = {
        first_name: 'Jane',
        last_name: 'Doe',
        job: 'Product Manager',
        email: 'jane@example.com',
      };
      mockUsersService.update.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
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

      mockUsersService.delete.mockResolvedValue(user);

      const result = await controller.delete('1');
      expect(result).toEqual(user);
      expect(mockUsersService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUsersService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
