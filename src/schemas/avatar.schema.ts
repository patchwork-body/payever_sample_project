import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AvatarDocument = HydratedDocument<Avatar>;

@Schema({ timestamps: true })
export class Avatar {
  @Prop({ required: true })
  foreign_id: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  content_type: string;

  @Prop({ required: true })
  md5: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
