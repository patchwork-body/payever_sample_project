import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  first_name?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  last_name?: string;

  @ApiProperty({
    description: 'The job title of the user',
    example: 'Software Engineer',
    required: false,
  })
  job?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: false,
  })
  email?: string;
}
