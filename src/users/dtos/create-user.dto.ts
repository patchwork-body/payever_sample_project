import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
  })
  first_name: string;
  @ApiProperty({
    example: 'Doe',
  })
  last_name: string;
  @ApiProperty({
    example: 'Software Engineer',
  })
  job: string;
  @ApiProperty({
    example: 'test@mail.com',
  })
  email: string;
}
