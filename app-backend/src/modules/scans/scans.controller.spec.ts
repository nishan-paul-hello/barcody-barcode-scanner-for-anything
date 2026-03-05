import { Test, TestingModule } from '@nestjs/testing';
import { ScansController } from '@modules/scans/scans.controller';
import { ScansService } from '@modules/scans/scans.service';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

describe('ScansController', () => {
  let controller: ScansController;
  let service: ScansService;

  const mockScansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    bulkCreate: jest.fn(),
    findAllSince: jest.fn(),
  };

  const mockUser = { sub: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScansController],
      providers: [
        {
          provide: ScansService,
          useValue: mockScansService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScansController>(ScansController);
    service = module.get<ScansService>(ScansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a scan', async () => {
      const dto = {
        barcodeData: '123456',
        barcodeType: BarcodeType.EAN13,
        rawData: '123456',
        deviceType: DeviceType.WEB,
      };
      const expectedResult = { id: 'scan-1', ...dto, userId: mockUser.sub };

      mockScansService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockUser.sub, dto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(mockUser.sub, dto);
    });
  });

  describe('bulkCreate', () => {
    it('should handle duplicates and call bulkCreate', async () => {
      const dto = {
        scans: [
          {
            barcodeData: '123',
            barcodeType: BarcodeType.EAN13,
            rawData: '123',
            deviceType: DeviceType.WEB,
            scannedAt: '2023-01-01T12:00:00Z',
          },
          {
            barcodeData: '123', // Duplicate within 1 minute
            barcodeType: BarcodeType.EAN13,
            rawData: '123',
            deviceType: DeviceType.WEB,
            scannedAt: '2023-01-01T12:00:30Z',
          },
          {
            barcodeData: '456',
            barcodeType: BarcodeType.EAN13,
            rawData: '456',
            deviceType: DeviceType.WEB,
            scannedAt: '2023-01-01T12:00:00Z',
          },
        ],
      };

      const uniqueScans = [dto.scans[0], dto.scans[2]];
      mockScansService.bulkCreate.mockResolvedValue(uniqueScans);

      const result = await controller.bulkCreate(mockUser.sub, dto);

      expect(result.count).toBe(2);
      expect(service.bulkCreate).toHaveBeenCalledWith(mockUser.sub, uniqueScans);
    });
  });

  describe('findAll', () => {
    it('should return paginated scans', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

      mockScansService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser.sub, query as any);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.sub, query);
    });
  });

  describe('findSince', () => {
    it('should call findAllSince with timestamp', async () => {
      const timestamp = '2023-01-01T12:00:00Z';
      const query = { page: 1, limit: 10 };
      const expectedResult = { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

      mockScansService.findAllSince.mockResolvedValue(expectedResult);

      const result = await controller.findSince(mockUser.sub, timestamp, query as any);

      expect(result).toEqual(expectedResult);
      expect(service.findAllSince).toHaveBeenCalledWith(mockUser.sub, timestamp, query);
    });
  });

  describe('findOne', () => {
    it('should return a scan', async () => {
      const scanId = 'scan-uuid';
      const expectedResult = { id: scanId, userId: mockUser.sub };

      mockScansService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(mockUser.sub, scanId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.sub, scanId);
    });
  });

  describe('remove', () => {
    it('should delete a scan', async () => {
      const scanId = 'scan-uuid';
      mockScansService.delete.mockResolvedValue(undefined);

      await controller.remove(mockUser.sub, scanId);

      expect(service.delete).toHaveBeenCalledWith(mockUser.sub, scanId);
    });
  });
});
