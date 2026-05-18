import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { FilesController } from '../src/files/files.controller';
import { FilesService } from '../src/files/files.service';
import request from 'supertest';
import { Response } from 'superagent';

interface UploadResponse {
  url: string;
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

describe('FilesController (e2e)', () => {
  let app: INestApplication;

  const uploadsDir = join(process.cwd(), 'public', 'uploads');

  beforeAll(async () => {
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /files', () => {
    it('should upload jpeg image', async () => {
      const fixturePath = join(process.cwd(), 'test', 'fixtures', 'image.jpg');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response: Response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', fixturePath)
        .expect(201);

      const body = response.body as UploadResponse;

      expect(body).toHaveProperty('url');

      expect(body.url).toContain('/public/uploads/');
      expect(body.url).toMatch(/\.jpg$/);

      const filename = body.url.split('/').pop();

      expect(filename).toBeDefined();

      const uploadedFilePath = join(uploadsDir, filename ?? '');

      expect(existsSync(uploadedFilePath)).toBe(true);

      unlinkSync(uploadedFilePath);
    });

    it('should upload png image', async () => {
      const fixturePath = join(process.cwd(), 'test', 'fixtures', 'image.png');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response: Response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', fixturePath)
        .expect(201);

      const body = response.body as UploadResponse;

      expect(body.url).toMatch(/\.png$/);

      const filename = body.url.split('/').pop();

      const uploadedFilePath = join(uploadsDir, filename ?? '');

      expect(existsSync(uploadedFilePath)).toBe(true);

      unlinkSync(uploadedFilePath);
    });

    it('should upload webp image', async () => {
      const fixturePath = join(process.cwd(), 'test', 'fixtures', 'image.webp');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response: Response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', fixturePath)
        .expect(201);

      const body = response.body as UploadResponse;

      expect(body.url).toMatch(/\.webp$/);

      const filename = body.url.split('/').pop();

      const uploadedFilePath = join(uploadsDir, filename ?? '');

      expect(existsSync(uploadedFilePath)).toBe(true);

      unlinkSync(uploadedFilePath);
    });

    it('should reject non-image file', async () => {
      const fixturePath = join(process.cwd(), 'test', 'fixtures', 'file.txt');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response: Response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', fixturePath)
        .expect(400);

      const body = response.body as ErrorResponse;

      expect(body.message).toContain('File is required');
    });

    it('should reject file larger than 2mb', async () => {
      const fixturePath = join(
        process.cwd(),
        'test',
        'fixtures',
        'large-image.jpg',
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response: Response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', fixturePath)
        .expect(413);

      const body = response.body as ErrorResponse;

      expect(body.message).toContain('File too large');
    });

    it('should return error when file is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/files').expect(400);
    });
  });
});
