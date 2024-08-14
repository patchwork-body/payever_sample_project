import { Test, TestingModule } from '@nestjs/testing';
import { AvatarsService } from './avatars.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Avatar } from '~/schemas/avatar.schema';
import { CreateAvatarDto } from './dtos/create-avatar.dto';
import * as fs from 'fs';
import { ObjectId } from 'mongodb';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const mockAvatarModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'UPLOAD_DIR':
        return '/tmp';
      default:
        return null;
    }
  }),
};

describe('AvatarsService', () => {
  let service: AvatarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AvatarsService,
        {
          provide: getModelToken(Avatar.name),
          useValue: mockAvatarModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an avatar', async () => {
      const id = '123';

      const avatar: CreateAvatarDto = {
        filename: 'avatar.jpg',
        content: Buffer.from('base64content'),
        content_type: 'image/jpeg',
      };

      mockAvatarModel.create.mockReturnValue(avatar);
      const result = await service.create(id, avatar);

      expect(result).toEqual(avatar);
    });

    it('should throw an exception when failed to write an avatar', async () => {
      const id = '123';

      const avatar: CreateAvatarDto = {
        filename: 'avatar.jpg',
        content: Buffer.from('base64content'),
        content_type: 'image/jpeg',
      };

      mockAvatarModel.create.mockImplementation(() => {
        throw new Error('Failed to write an avatar');
      });

      await expect(service.create(id, avatar)).rejects.toThrow(
        'Failed to write an avatar',
      );
    });
  });

  describe('findOne', () => {
    it('should find an avatar', async () => {
      const id = '123';

      const avatar = {
        filename: 'avatar.jpg',
        content: Buffer.from('base64content'),
        content_type: 'image/jpeg',
      };

      mockAvatarModel.findOne.mockReturnValue(avatar);
      const result = await service.findOne(id);

      expect(result).toEqual(avatar);
    });

    it('should throw an exception when avatar not found', async () => {
      const id = '123';

      mockAvatarModel.findOne.mockReturnValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        `Avatar with ID: ${id} not found`,
      );
    });

    it('should throw an exception when failed to read an avatar', async () => {
      const id = '123';

      const avatar = {
        filename: 'avatar.jpg',
        content: Buffer.from('base64content'),
        content_type: 'image/jpeg',
      };

      mockAvatarModel.findOne.mockReturnValue(avatar);
      mockConfigService.get.mockReturnValue('/nonexistent');

      await expect(service.findOne(id)).rejects.toThrow(
        "ENOENT: no such file or directory, open '/nonexistent/avatar.jpg'",
      );
    });
  });

  describe('delete', () => {
    it('should delete an avatar', async () => {
      const id = '123';

      const avatar = {
        id: new ObjectId().toString(),
        foreign_id: '123',
        md5: 'md5',
        filename: 'avatar.jpg',
        content_type: 'image/jpeg',
      };

      mockConfigService.get.mockReturnValue('/tmp');
      mockAvatarModel.findOneAndDelete.mockReturnValue(avatar);
      jest.spyOn(fs.promises, 'unlink').mockResolvedValue();
      const result = await service.delete(id);

      expect(fs.promises.unlink).toHaveBeenCalledWith('/tmp/avatar.jpg');
      expect(result).toEqual({ id: avatar.id });
    });

    it('should throw an exception when avatar not found', async () => {
      const id = '123';

      mockAvatarModel.findOneAndDelete.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.delete(id)).rejects.toThrow('Not Found');
    });

    it('should throw an exception when failed to delete an avatar', async () => {
      const id = '123';

      const avatar = {
        filename: 'avatar.jpg',
        content: Buffer.from('base64content'),
        content_type: 'image/jpeg',
      };

      jest
        .spyOn(fs.promises, 'unlink')
        .mockRejectedValue(new Error('Failed to delete an avatar'));
      mockAvatarModel.findOneAndDelete.mockReturnValue(avatar);

      await expect(service.delete(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
