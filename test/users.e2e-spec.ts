import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '~/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userId: string;

  const user = {
    email: 'john@mail.com',
    first_name: 'John',
    last_name: 'Doe',
    job: 'Developer',
  };

  const reqres_user = {
    id: 8,
    email: 'lindsay.ferguson@reqres.in',
    first_name: 'Lindsay',
    last_name: 'Ferguson',
    avatar: 'https://reqres.in/img/faces/8-image.jpg',
  };

  const updated_user = {
    first_name: 'Jane',
    last_name: 'Doe',
    job: 'Designer',
    email: 'jane@mail.com',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer()).get('/users').expect(200).expect([]);
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            job: user.job,
            id: expect.any(String),
          }),
        );

        userId = res.body.id;
      });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect({
        id: userId,
        ...user,
      });
  });

  it('/users/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send(updated_user)
      .expect(200)
      .expect({
        id: userId,
        ...updated_user,
      });
  });

  it('/users/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200)
      .expect({
        id: userId,
        ...updated_user,
      });
  });

  it('/users/:id (GET) - Not Found', () => {
    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            error: 'Not Found',
            message: expect.stringMatching(/^User with ID/),
          }),
        );
      });
  });

  it('/users/:id (PUT) - Not Found', () => {
    return request(app.getHttpServer())
      .put(`/users/${userId}`)
      .send(updated_user)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            error: 'Not Found',
            message: expect.stringMatching(/^User with ID/),
          }),
        );
      });
  });

  it('/users/:id (DELETE) - Not Found', () => {
    return request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            error: 'Not Found',
            message: expect.stringMatching(/^User with ID/),
          }),
        );
      });
  });

  it('/users/:id (GET) - Not Found', () => {
    return request(app.getHttpServer())
      .get('/users/invalid_id')
      .expect(404)
      .expect({
        message: 'User with id invalid_id not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });

  it('/users/:id (PUT) - Invalid ID', () => {
    return request(app.getHttpServer())
      .put('/users/invalid_id')
      .send(updated_user)
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid ID',
      });
  });

  it('/users/:id (DELETE) - Invalid ID', () => {
    return request(app.getHttpServer())
      .delete('/users/invalid_id')
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid ID',
      });
  });

  it('/users/:id/avatar (GET) - Reqres', () => {
    return request(app.getHttpServer())
      .get(`/users/${reqres_user.id}/avatar`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            foreign_id: reqres_user.id.toString(),
            filename: expect.any(String),
            content_type: 'image/jpeg',
            md5: expect.any(String),
            content: expect.any(String),
          }),
        );
      });
  });

  it('/users/:id/avatar (GET) - Reqres Not Found', () => {
    return request(app.getHttpServer())
      .get('/users/1000/avatar')
      .expect(404)
      .expect({
        statusCode: 404,
        error: 'Not Found',
        message: 'User with id 1000 not found',
      });
  });

  it('/users/:id/avatar (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/users/${reqres_user.id}/avatar`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
          }),
        );
      });
  });

  it('/users/:id/avatar (DELETE) - Reqres Not Found', () => {
    return request(app.getHttpServer())
      .delete('/users/1000/avatar')
      .expect(404)
      .expect({
        message: 'Avatar with ID: 1000 not found',
        error: 'Not Found',
        statusCode: 404,
      });
  });
});
