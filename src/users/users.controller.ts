import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dtos/user.dto';
import { DeleteAvatarDto } from '~/avatars/dtos/delete-avatar.dto';
import { AvatarDto } from '~/avatars/dtos/avatar.dto';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
    type: UserDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
    type: Array<UserDto>,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated',
    type: UserDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted',
    type: UserDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.delete(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar found',
    type: AvatarDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avatar not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to retrieve avatar',
  })
  @Get(':id/avatar')
  @HttpCode(HttpStatus.OK)
  async fetchAvatar(@Param('id') id: string): Promise<AvatarDto> {
    return this.usersService.fetchAvatar(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar deleted',
    type: DeleteAvatarDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avatar not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete avatar',
  })
  @Delete(':id/avatar')
  @HttpCode(HttpStatus.OK)
  async deleteAvatar(@Param('id') id: string): Promise<DeleteAvatarDto> {
    return this.usersService.deleteAvatar(id);
  }
}
