import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvatarsService } from './avatars.service';
import { Avatar, AvatarSchema } from '~/schemas/avatar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
  ],
  providers: [AvatarsService],
  controllers: [],
  exports: [AvatarsService],
})
export class AvatarsModule {}
