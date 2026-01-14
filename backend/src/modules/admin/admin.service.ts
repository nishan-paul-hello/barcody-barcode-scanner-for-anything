import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { Scan } from '@/database/entities/scan.entity';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  AnalyticsOverviewDto,
  TrendDataDto,
  BarcodeTypeDistributionDto,
  DeviceDistributionDto,
} from './dto/analytics-response.dto';
import { UserListDto, ScanListDto } from './dto/list-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
  ) {}

  async getOverview(): Promise<AnalyticsOverviewDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalScans, totalUsers, activeToday] = await Promise.all([
      this.scanRepository.count(),
      this.userRepository.count(),
      this.scanRepository.count({
        where: {
          scannedAt: MoreThanOrEqual(today),
        },
      }),
    ]);

    return {
      totalScans,
      totalUsers,
      activeToday,
    };
  }

  async getTrends(filter: AnalyticsFilterDto): Promise<TrendDataDto> {
    const { startDate, endDate } = filter;

    const queryBuilder = this.scanRepository
      .createQueryBuilder('scan')
      .select("DATE_TRUNC('day', scan.scannedAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_TRUNC('day', scan.scannedAt)")
      .orderBy("DATE_TRUNC('day', scan.scannedAt)", 'ASC');

    if (startDate) {
      queryBuilder.andWhere('scan.scannedAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('scan.scannedAt <= :endDate', { endDate });
    }

    const rawData = await queryBuilder.getRawMany();

    return {
      data: rawData.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        count: parseInt(row.count, 10),
      })),
    };
  }

  async getBarcodeTypes(): Promise<BarcodeTypeDistributionDto[]> {
    const rawData = await this.scanRepository
      .createQueryBuilder('scan')
      .select('scan.barcodeType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scan.barcodeType')
      .getRawMany();

    return rawData.map((row) => ({
      type: row.type,
      count: parseInt(row.count, 10),
    }));
  }

  async getDevices(): Promise<DeviceDistributionDto[]> {
    const rawData = await this.scanRepository
      .createQueryBuilder('scan')
      .select('scan.deviceType', 'device')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scan.deviceType')
      .getRawMany();

    return rawData.map((row) => ({
      device: row.device,
      count: parseInt(row.count, 10),
    }));
  }

  async getUsers(pagination: PaginationDto): Promise<UserListDto> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepository.findAndCount({
      order: { [sortBy]: sortOrder },
      take: limit,
      skip,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getScans(pagination: PaginationDto, filter: AnalyticsFilterDto): Promise<ScanListDto> {
    const { page = 1, limit = 50, sortBy = 'scannedAt', sortOrder = 'DESC' } = pagination;
    const { startDate, endDate, query } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.scanRepository
      .createQueryBuilder('scan')
      .leftJoinAndSelect('scan.user', 'user')
      .orderBy(`scan.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('scan.scannedAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('scan.scannedAt <= :endDate', { endDate });
    }
    if (query) {
      queryBuilder.andWhere('(scan.barcodeData ILIKE :query OR user.email ILIKE :query)', {
        query: `%${query}%`,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
