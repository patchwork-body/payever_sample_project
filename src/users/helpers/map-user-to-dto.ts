import { UserDocument } from '~/schemas/user.schema';
import { UserDto } from '~/users/dtos/user.dto';

export function mapUserToUserDto(user: UserDocument): UserDto {
  return {
    id: user.id,
    email: user.email,
    job: user.job,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
