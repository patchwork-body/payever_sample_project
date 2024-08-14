import { AvatarDocument } from '~/schemas/avatar.schema';
import { AvatarDto } from '../dtos/avatar.dto';

export const mapAvatarToDto = (
  avatar: AvatarDocument,
  content: Buffer,
): AvatarDto => {
  return {
    id: avatar.id,
    foreign_id: avatar.foreign_id,
    filename: avatar.filename,
    content_type: avatar.content_type,
    md5: avatar.md5,
    content,
  };
};
