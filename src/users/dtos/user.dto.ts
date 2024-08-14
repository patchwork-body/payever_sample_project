import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'The id of the user',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The job title of the user',
    example: 'Software Engineer',
  })
  job: string;

  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
  last_name: string;

  @ApiProperty({
    required: false,
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;
}
