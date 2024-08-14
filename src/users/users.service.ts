import { catchError, firstValueFrom, map } from 'rxjs';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { mapUserToUserDto } from './helpers/map-user-to-dto';
import { User } from '~/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AvatarsService } from '~/avatars/avatars.service';
import { AvatarDto } from '~/avatars/dtos/avatar.dto';
import { DeleteAvatarDto } from '~/avatars/dtos/delete-avatar.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private rabbitMqClient: ClientProxy;
  private mailTransporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly avatarService: AvatarsService,
  ) {
    this.rabbitMqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URI')],
        queue: 'main_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    this.mailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    let reqresUser = await this.createReqresUser(createUserDto);

    try {
      const doc = await this.userModel.create(reqresUser);
      const user = await doc.save();
      this.logger.log(`User created with ID: ${user.id}`);

      // Send a dummy event message to RabbitMQ
      this.rabbitMqClient.emit('user_created', {
        id: user.id,
        event: 'USER_CREATED',
      });

      // Send a dummy email
      await this.sendDummyEmail(user.email);

      return mapUserToUserDto(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findAll(): Promise<UserDto[]> {
    try {
      const users = await this.userModel.find().exec();
      this.logger.log(`Retrieved ${users.length} users`);

      return users.map(mapUserToUserDto);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      return await this.retrieveReqresUser(id);
    }

    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Retrieved user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async fetchAvatar(id: string): Promise<AvatarDto> {
    try {
      let avatar = await this.avatarService.findOne(id);
      return avatar;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(error.message);
        let avatarBuffer = await this.retrieveReqresUserAvatar(id);

        return this.avatarService.create(id, {
          filename: `avatar-${id}.jpg`,
          content_type: 'image/jpeg',
          content: avatarBuffer,
        });
      }

      throw error;
    }
  }

  async deleteAvatar(id: string): Promise<DeleteAvatarDto> {
    return this.avatarService.delete(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid ID: ${id}`);
      throw new BadRequestException('Invalid ID');
    }

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Updated user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async delete(id: string): Promise<UserDto> {
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid ID: ${id}`);
      throw new BadRequestException('Invalid ID');
    }

    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Deleted user with ID: ${id}`);

      return mapUserToUserDto(user);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async retrieveReqresUser(id: string): Promise<UserDto> {
    const url = new URL(
      `/api/users/${id}`,
      this.configService.get<string>('REQRES_API_URL'),
    ).toString();

    this.logger.debug(`Retrieving user from Reqres: ${url}`);

    return firstValueFrom(
      this.httpService
        .get<{ data: UserDto }>(url)
        .pipe(
          catchError((error) => {
            if (error.response && error.response.status === 404) {
              this.logger.error(`User with id ${id} not found in Reqres`);
              throw new NotFoundException(`User with id ${id} not found`);
            }

            this.logger.error('Failed to retrieve user from Reqres', error);
            throw new InternalServerErrorException(
              'Failed to retrieve user from Reqres',
            );
          }),
        )
        .pipe(map((response) => response.data.data)),
    );
  }

  async retrieveReqresUserAvatar(id: string): Promise<Buffer> {
    const url = new URL(
      `/api/users/${id}`,
      this.configService.get<string>('REQRES_API_URL'),
    ).toString();

    this.logger.debug(`Retrieving user avatar from Reqres: ${url}`);

    let { avatar } = await this.retrieveReqresUser(id);

    return firstValueFrom(
      this.httpService
        .get(avatar, { responseType: 'arraybuffer' })
        .pipe(
          catchError((error) => {
            this.logger.error(
              'Failed to retrieve user avatar from Reqres',
              error,
            );

            throw new InternalServerErrorException(
              'Failed to retrieve user avatar from Reqres',
            );
          }),
        )
        .pipe(
          map((response) => {
            return Buffer.from(response.data);
          }),
        ),
    );
  }

  async createReqresUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const url = new URL(
      '/api/users',
      this.configService.get<string>('REQRES_API_URL'),
    ).toString();

    this.logger.debug(`Creating user in Reqres: ${url}`);

    return firstValueFrom(
      this.httpService
        .post<UserDto>(url, createUserDto)
        .pipe(
          catchError((error) => {
            this.logger.error('Failed to create user in Reqres', error);
            throw new InternalServerErrorException(
              'Failed to create user in Reqres',
            );
          }),
        )
        .pipe(map((response) => response.data)),
    );
  }

  // In real-world applications, you would use a library like SendGrid or Mailgun to send emails
  // And probably would create a dedicated service for sending emails
  async sendDummyEmail(email: string): Promise<void> {
    const mailOptions = {
      from: '"Awesome.app" <no-reply@yourapp.com>',
      to: email,
      subject: 'Welcome to Awesome.app',
      text: 'Hello, welcome to Awesome.app!',
      html: '<b>Hello, welcome to Awesome.app!</b>',
    };

    try {
      await this.mailTransporter.sendMail(mailOptions);
      this.logger.log(`Dummy email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error.message}`);
    }
  }
}
