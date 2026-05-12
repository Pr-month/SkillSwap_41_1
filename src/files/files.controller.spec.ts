import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  const mockFilesService = {
    createFileUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('должен возвращать полный URL загруженного файла', () => {
      const mockFile = {
        filename: 'test.png',
      } as Partial<Express.Multer.File> as Express.Multer.File;
      const mockGetFunction = jest.fn().mockReturnValue('localhost:3000');
      const mockRequest = {
        protocol: 'http',
        get: mockGetFunction,
      } as Partial<Request> as Request;
      mockFilesService.createFileUrl.mockReturnValue(
        '/public/uploads/test.png',
      );

      const result = controller.upload(mockFile, mockRequest);
      expect(mockFilesService.createFileUrl).toHaveBeenCalledWith(mockFile);
      expect(mockGetFunction).toHaveBeenCalledWith('host');
      expect(result).toEqual({
        url: 'http://localhost:3000/public/uploads/test.png',
      });
    });
  });
});
