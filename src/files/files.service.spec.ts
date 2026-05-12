import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
describe('FilesService', () => {
  let service: FilesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFileUrl', () => {
    it('должен возвращать правильный путь до файла', () => {
      const mockFile = {
        filename: 'my-avatar.webp',
      } as Express.Multer.File;
      const result = service.createFileUrl(mockFile);
      expect(result).toBe('/public/uploads/my-avatar.webp');
    });
  });
});
