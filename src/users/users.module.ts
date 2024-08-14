import { Module } from '@nestjs/common';
import { User, UserSchema } from '~/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { AvatarsModule } from '~/avatars/avatars.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AvatarsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
