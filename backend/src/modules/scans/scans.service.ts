import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { Scan } from '@database/entities/scan.entity';
import { CreateScanDto } from './dto/create-scan.dto';
import { ScanQueryDto } from './dto/scan-query.dto';
import { ScansGateway } from './scans.gateway';

@Injectable()
export class ScansService {
  private readonly logger = new Logger(ScansService.name);

  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
    private readonly dataSource: DataSource,
    private readonly scansGateway: ScansGateway,
  ) {}

  async create(userId: string, createScanDto: CreateScanDto): Promise<Scan> {
    this.logger.log(`Creating scan for user ${userId}`);

    const scan = this.scanRepository.create({
      ...createScanDto,
      userId,
    });

    const savedScan = await this.scanRepository.save(scan);
    this.scansGateway.emitScanCreated(userId, savedScan);
    return savedScan;
  }

  async findAll(userId: string, query: ScanQueryDto) {
    const {
      page = 1,
      limit = 50,
      barcodeType,
      deviceType,
      startDate,
      endDate,
      sortBy = 'scannedAt',
      order = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Scan> = { userId };

    if (barcodeType) where.barcodeType = barcodeType;
    if (deviceType) where.deviceType = deviceType;

    this.applyDateFilters(where, startDate, endDate);

    const [items, total] = await this.scanRepository.findAndCount({
      where,
      order: { [sortBy]: order } as never,
      take: limit,
      skip,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllSince(userId: string, timestamp: string, query: ScanQueryDto) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await this.scanRepository.findAndCount({
      where: {
        userId,
        scannedAt: MoreThanOrEqual(new Date(timestamp)),
      },
      order: { scannedAt: 'ASC' },
      take: limit,
      skip,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private applyDateFilters(where: FindOptionsWhere<Scan>, startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      where.scannedAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.scannedAt = Between(new Date(startDate), new Date());
    } else if (endDate) {
      where.scannedAt = Between(new Date(0), new Date(endDate));
    }
  }

  async findOne(userId: string, id: string): Promise<Scan> {
    const scan = await this.scanRepository.findOne({
      where: { id, userId },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    return scan;
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.scanRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    this.scansGateway.emitScanDeleted(userId, id);
  }

  async bulkCreate(userId: string, scanDtos: CreateScanDto[]): Promise<Scan[]> {
    this.logger.log(`Bulk creating ${scanDtos.length} scans for user ${userId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scans = scanDtos.map((dto) =>
        this.scanRepository.create({
          ...dto,
          userId,
        }),
      );

      const savedScans = await queryRunner.manager.save(Scan, scans);
      await queryRunner.commitTransaction();

      // Emit events for all created scans
      savedScans.forEach((scan) => {
        this.scansGateway.emitScanCreated(userId, scan);
      });

      return savedScans;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to bulk create scans: ${errorMessage}`);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
