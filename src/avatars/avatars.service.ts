import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { readFile, unlink, writeFile } from 'fs/promises';
import { Model } from 'mongoose';
import { join } from 'path';
import { Avatar } from '~/schemas/avatar.schema';
import { AvatarDto } from './dtos/avatar.dto';
import { DeleteAvatarDto } from './dtos/delete-avatar.dto';
import { mapAvatarToDto } from './helpers/map-avatar-to-dto';
import { CreateAvatarDto } from './dtos/create-avatar.dto';

@Injectable()
export class AvatarsService {
  private readonly logger = new Logger(AvatarsService.name);

  constructor(
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    id: string,
    createAvatarDto: CreateAvatarDto,
  ): Promise<AvatarDto> {
    const path = join(
      this.configService.get<string>('UPLOAD_DIR'),
      createAvatarDto.filename,
    );

    try {
      await writeFile(path, createAvatarDto.content, {
        encoding: 'base64',
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        `Failed to write an avatar ${createAvatarDto.filename}`,
      );
    }

    const avatar = await this.avatarModel.create({
      foreign_id: id,
      filename: createAvatarDto.filename,
      content_type: createAvatarDto.content_type,
      md5: crypto
        .createHash('md5')
        .update(createAvatarDto.content)
        .digest('hex'),
    });

    return mapAvatarToDto(avatar, createAvatarDto.content);
  }

  async findOne(id: string): Promise<AvatarDto> {
    try {
      const avatar = await this.avatarModel.findOne({ foreign_id: id });

      if (!avatar) {
        this.logger.warn(`Avatar with ID: ${id} not found`);
        throw new NotFoundException(`Avatar with ID: ${id} not found`);
      }

      const path = join(
        this.configService.get<string>('UPLOAD_DIR'),
        avatar.filename,
      );

      const content = await readFile(path);

      return mapAvatarToDto(avatar, content);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<DeleteAvatarDto> {
    try {
      const avatar = await this.avatarModel.findOneAndDelete({
        foreign_id: id,
      });

      if (!avatar) {
        this.logger.warn(`Avatar with ID: ${id} not found`);
        throw new NotFoundException(`Avatar with ID: ${id} not found`);
      }

      const path = join(
        this.configService.get<string>('UPLOAD_DIR'),
        avatar.filename,
      );

      try {
        await unlink(path);
      } catch (error) {
        this.logger.error(error.message);
        throw new InternalServerErrorException(
          `Failed to delete an avatar ${avatar.filename}`,
        );
      }

      return {
        id: avatar.id,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
