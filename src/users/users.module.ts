import { Module } from '@nestjs/common';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
    ),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
