import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { mapUserToUserDto } from './helpers/map-user-to-dto';
import { User } from '~/schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      const doc = await this.userModel.create(createUserDto);
      const user = await doc.save();
      this.logger.log(`User created with ID: ${user._id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<UserDto[]> {
    try {
      const users = await this.userModel.find().exec();
      this.logger.log(`Retrieved ${users.length} users`);

      return users.map(mapUserToUserDto);
    } catch (error) {
      this.logger.error('Failed to retrieve users', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findOne(id: string): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid ID: ${id}`);
      throw new BadRequestException('Invalid ID');
    }

    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Retrieved user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(error.message);
        throw error;
      }

      this.logger.error('Failed to retrieve user', error);
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid ID: ${id}`);
      throw new BadRequestException('Invalid ID');
    }

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Updated user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(error.message);
        throw error;
      }

      this.logger.error('Failed to update user', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: string): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid ID: ${id}`);
      throw new BadRequestException('Invalid ID');
    }

    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Deleted user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(error.message);
        throw error;
      }

      this.logger.error('Failed to delete user', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
