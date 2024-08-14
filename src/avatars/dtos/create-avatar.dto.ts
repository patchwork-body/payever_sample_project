import { ApiProperty } from '@nestjs/swagger';

export class CreateAvatarDto {
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
    description: 'The content of the avatar',
    example: Buffer.from('image data').toString('base64'),
  })
  content: Buffer;
}
