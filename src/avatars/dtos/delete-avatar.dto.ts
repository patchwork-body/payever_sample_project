import { ApiProperty } from '@nestjs/swagger';

export class DeleteAvatarDto {
  @ApiProperty({
    description: 'The id of the avatar',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;
}
