import { ApiProperty } from '@nestjs/swagger';

export class AvatarDto {
  @ApiProperty({
    description: 'The id of the avatar',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'The foreign id of the avatar',
    example: '507f1f77bcf86cd799439011',
  })
  foreignId: string;

  @ApiProperty({
    description: 'The filename of the avatar',
    example: 'avatar.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'The content type of the avatar',
    example: 'image/jpeg',
  })
  contentType: string;

  @ApiProperty({
    description: 'The MD5 hash of the avatar',
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  md5: string;

  @ApiProperty({
    description: 'The content of the avatar',
    example: Buffer.from('image data').toString('base64'),
  })
  content: Buffer;
}
