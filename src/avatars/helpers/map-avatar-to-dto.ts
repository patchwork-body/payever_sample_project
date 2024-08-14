import { AvatarDocument } from '~/schemas/avatar.schema';
import { AvatarDto } from '../dtos/avatar.dto';

export const mapAvatarToDto = (
  avatar: AvatarDocument,
  content: Buffer,
): AvatarDto => {
  return {
    id: avatar.id,
    foreignId: avatar.foreignId,
    filename: avatar.filename,
    contentType: avatar.contentType,
    md5: avatar.md5,
    content,
  };
};
