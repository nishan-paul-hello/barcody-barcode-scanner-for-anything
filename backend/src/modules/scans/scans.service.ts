import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual, In, SelectQueryBuilder } from 'typeorm';
import { Scan } from '@database/entities/scan.entity';
import { CreateScanDto } from '@modules/scans/dto/create-scan.dto';
import { ScanQueryDto } from '@modules/scans/dto/scan-query.dto';
import { ScansGateway } from '@modules/scans/scans.gateway';

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
    const { page = 1, limit = 50, sortBy = 'scannedAt', order = 'DESC', search } = query;

    const skip = (page - 1) * limit;
    const queryBuilder = this.scanRepository.createQueryBuilder('scan');

    queryBuilder.where('scan.userId = :userId', { userId });

    this.applyFilters(queryBuilder, query);
    this.applySearch(queryBuilder, search, sortBy, order);

    if (sortBy !== 'relevance') {
      this.applySorting(queryBuilder, sortBy, order);
    }

    const total = await queryBuilder.getCount();
    const rawAndEntities = await queryBuilder.offset(skip).limit(limit).getRawAndEntities();

    const items = rawAndEntities.entities.map((entity, index) => {
      const relevance = rawAndEntities.raw[index]?.relevance;
      return {
        ...entity,
        relevance: relevance ? parseFloat(relevance) : undefined,
      };
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

  private applyFilters(queryBuilder: SelectQueryBuilder<Scan>, query: ScanQueryDto) {
    const { barcodeType, deviceType, category, nutritionGrade, startDate, endDate } = query;

    if (barcodeType) {
      queryBuilder.andWhere('scan.barcodeType = :barcodeType', { barcodeType });
    }

    if (deviceType) {
      queryBuilder.andWhere('scan.deviceType = :deviceType', { deviceType });
    }

    if (category) {
      queryBuilder.andWhere('scan.category = :category', { category });
    }

    if (nutritionGrade) {
      queryBuilder.andWhere('scan.nutritionGrade = :nutritionGrade', { nutritionGrade });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('scan.scannedAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('scan.scannedAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      queryBuilder.andWhere('scan.scannedAt <= :endDate', { endDate: new Date(endDate) });
    }
  }

  private applySearch(
    queryBuilder: SelectQueryBuilder<Scan>,
    search: string | undefined,
    sortBy: string,
    order: 'ASC' | 'DESC',
  ) {
    if (!search) return;

    const tsQuery = search
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `${t}:*`)
      .join(' & ');

    if (tsQuery) {
      queryBuilder.addSelect(
        "ts_rank(to_tsvector('english', scan.barcode_data || ' ' || COALESCE(scan.product_name, '')), to_tsquery('english', :tsQuery))",
        'relevance',
      );
      queryBuilder.andWhere(
        "to_tsvector('english', scan.barcode_data || ' ' || COALESCE(scan.product_name, '')) @@ to_tsquery('english', :tsQuery)",
        { tsQuery },
      );

      if (sortBy === 'relevance') {
        queryBuilder.orderBy('relevance', order);
      }
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Scan>,
    sortBy: string,
    order: 'ASC' | 'DESC',
  ) {
    const sortMap: Record<string, string> = {
      scannedAt: 'scan.scannedAt',
      barcodeType: 'scan.barcodeType',
      productName: 'scan.productName',
      nutritionGrade: 'scan.nutritionGrade',
    };
    const sortColumn = sortMap[sortBy] || 'scan.scannedAt';
    queryBuilder.orderBy(sortColumn, order);
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

  async bulkDelete(userId: string, ids: string[]): Promise<{ count: number }> {
    this.logger.log(`User ${userId} bulk deleting ${ids.length} scans`);
    const result = await this.scanRepository.delete({
      id: In(ids),
      userId,
    });

    // Emit events for all deleted scans
    ids.forEach((id) => {
      this.scansGateway.emitScanDeleted(userId, id);
    });

    return { count: result.affected || 0 };
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
