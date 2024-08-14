import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AvatarDocument = HydratedDocument<Avatar>;

@Schema({ timestamps: true })
export class Avatar {
  @Prop({ required: true })
  foreignId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  md5: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
