import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ScansService } from './scans.service';
import { Scan } from '@database/entities/scan.entity';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';
import { NotFoundException } from '@nestjs/common';

describe('ScansService', () => {
  let service: ScansService;
  let repository: Repository<Scan>;

  const mockScanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScansService,
        {
          provide: getRepositoryToken(Scan),
          useValue: mockScanRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ScansService>(ScansService);
    repository = module.get<Repository<Scan>>(getRepositoryToken(Scan));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new scan', async () => {
      const userId = 'user-123';
      const dto = {
        barcodeData: '123456',
        barcodeType: BarcodeType.EAN13,
        rawData: '123456',
        deviceType: DeviceType.WEB,
      };
      const expectedScan = { id: 'scan-123', ...dto, userId };

      mockScanRepository.create.mockReturnValue(expectedScan);
      mockScanRepository.save.mockResolvedValue(expectedScan);

      const result = await service.create(userId, dto);

      expect(result).toEqual(expectedScan);
      expect(mockScanRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId,
      });
      expect(mockScanRepository.save).toHaveBeenCalledWith(expectedScan);
    });
  });

  describe('findAll', () => {
    it('should return paginated scans', async () => {
      const userId = 'user-123';
      const query = { page: 1, limit: 10 };
      const scans = [{ id: '1' }, { id: '2' }];
      const total = 2;

      mockScanRepository.findAndCount.mockResolvedValue([scans, total]);

      const result = await service.findAll(userId, query as any);

      expect(result.items).toEqual(scans);
      expect(result.meta.total).toBe(total);
      expect(repository.findAndCount).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const userId = 'user-123';
      const query = {
        barcodeType: BarcodeType.QR,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      };

      mockScanRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(userId, query as any);

      expect(mockScanRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            barcodeType: BarcodeType.QR,
            scannedAt: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a scan if found', async () => {
      const userId = 'user-123';
      const scanId = 'scan-123';
      const scan = { id: scanId, userId };

      mockScanRepository.findOne.mockResolvedValue(scan);

      const result = await service.findOne(userId, scanId);

      expect(result).toEqual(scan);
    });

    it('should throw NotFoundException if not found', async () => {
      mockScanRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'scan-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a scan', async () => {
      mockScanRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('user-1', 'scan-1');

      expect(mockScanRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if scan to delete is not found', async () => {
      mockScanRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('user-1', 'scan-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple scans in a transaction', async () => {
      const userId = 'user-1';
      const dtos = [{ barcodeData: '1' }, { barcodeData: '2' }];
      const scans = dtos.map((d) => ({ ...d, userId }));

      mockScanRepository.create.mockImplementation((dto) => dto);
      mockQueryRunner.manager.save.mockResolvedValue(scans);

      const result = await service.bulkCreate(userId, dtos as any);

      expect(result).toEqual(scans);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.bulkCreate('user-1', [])).rejects.toThrow('DB Error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
