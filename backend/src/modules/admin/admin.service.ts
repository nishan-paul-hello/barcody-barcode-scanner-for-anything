import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { Scan } from '@/database/entities/scan.entity';
import { BarcodeType } from '@/common/enums/barcode-type.enum';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  AnalyticsOverviewDto,
  TrendDataDto,
  BarcodeTypeDistributionDto,
  DeviceDistributionDto,
  RetentionCohortsDto,
  TopBarcodeDto,
  HourlyActivityDto,
} from './dto/analytics-response.dto';
import { UserListDto, ScanListDto } from './dto/list-response.dto';
import {
  buildWeekStartsList,
  buildUserWeekMap,
  buildCohortMap,
  buildCohortRows,
} from './retention-cohort.utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
  ) {}

  async getOverview(): Promise<AnalyticsOverviewDto> {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      totalScans,
      totalUsers,
      activeToday,
      scansThisMonth,
      scansPrevMonth,
      usersThisMonth,
      usersPrevMonth,
      unknownScans,
    ] = await Promise.all([
      this.scanRepository.count(),
      this.userRepository.count(),
      this.scanRepository.count({ where: { scannedAt: MoreThanOrEqual(todayStart) } }),
      this.scanRepository.count({ where: { scannedAt: MoreThanOrEqual(thirtyDaysAgo) } }),
      this.scanRepository
        .createQueryBuilder('scan')
        .where('scan.scannedAt >= :start', { start: sixtyDaysAgo })
        .andWhere('scan.scannedAt < :end', { end: thirtyDaysAgo })
        .getCount(),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(thirtyDaysAgo) } }),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :start', { start: sixtyDaysAgo })
        .andWhere('user.createdAt < :end', { end: thirtyDaysAgo })
        .getCount(),
      this.scanRepository.count({ where: { barcodeType: BarcodeType.UNKNOWN } }),
    ]);

    const scanGrowthPercent = this.calcGrowthPercent(scansThisMonth, scansPrevMonth);
    const userGrowthPercent = this.calcGrowthPercent(usersThisMonth, usersPrevMonth);
    const successRate =
      totalScans === 0
        ? 0
        : parseFloat((((totalScans - unknownScans) / totalScans) * 100).toFixed(1));
    return {
      totalScans,
      totalUsers,
      activeToday,
      scanGrowthPercent,
      userGrowthPercent,
      successRate,
    };
  }

  async getTrends(filter: AnalyticsFilterDto): Promise<TrendDataDto> {
    const { startDate, endDate } = filter;

    const qb = this.scanRepository
      .createQueryBuilder('scan')
      .select("DATE_TRUNC('day', scan.scannedAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_TRUNC('day', scan.scannedAt)")
      .orderBy("DATE_TRUNC('day', scan.scannedAt)", 'ASC');

    if (startDate) qb.andWhere('scan.scannedAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('scan.scannedAt <= :endDate', { endDate });

    const rawData = await qb.getRawMany();

    return {
      data: rawData.map((row) => ({
        date: new Date(row.date).toISOString().split('T')[0] || '',
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

  /**
   * Weekly retention cohort analysis.
   *
   * A cohort is defined as users who performed their FIRST scan in a given week.
   * Retention for week N = (cohort users who also scanned in week N) / cohort size * 100.
   * Week 0 is always 100% by definition.
   * Only cohorts with at least 1 new user are returned.
   */
  async getRetentionCohorts(numWeeks = 8): Promise<RetentionCohortsDto> {
    const firstScanRows = await this.fetchFirstScanPerUser();
    if (firstScanRows.length === 0) return { cohorts: [] };

    const weeklyActivity = await this.fetchWeeklyActivity(numWeeks);
    const userWeekMap = buildUserWeekMap(weeklyActivity);
    const cohortMap = buildCohortMap(firstScanRows);
    const weekStarts = buildWeekStartsList(numWeeks);

    const cohorts = buildCohortRows(weekStarts, cohortMap, userWeekMap);
    return { cohorts };
  }

  async getTopBarcodes(limit = 20, filter?: AnalyticsFilterDto): Promise<TopBarcodeDto[]> {
    const qb = this.scanRepository
      .createQueryBuilder('scan')
      .select('scan.barcodeData', 'barcodeData')
      .addSelect('scan.barcodeType', 'barcodeType')
      .addSelect('MAX(scan.productName)', 'productName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scan.barcodeData, scan.barcodeType')
      .orderBy('count', 'DESC')
      .limit(limit);

    if (filter?.startDate) {
      qb.andWhere('scan.scannedAt >= :startDate', { startDate: filter.startDate });
    }
    if (filter?.endDate) {
      qb.andWhere('scan.scannedAt <= :endDate', { endDate: filter.endDate });
    }

    const rawData = await qb.getRawMany();
    return rawData.map((row) => ({
      barcodeData: row.barcodeData,
      barcodeType: row.barcodeType,
      productName: row.productName ?? null,
      count: parseInt(row.count, 10),
    }));
  }

  async getHourlyActivity(filter?: AnalyticsFilterDto): Promise<HourlyActivityDto[]> {
    const qb = this.scanRepository
      .createQueryBuilder('scan')
      .select("EXTRACT(HOUR FROM scan.scannedAt AT TIME ZONE 'UTC')", 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy("EXTRACT(HOUR FROM scan.scannedAt AT TIME ZONE 'UTC')")
      .orderBy('hour', 'ASC');

    if (filter?.startDate) {
      qb.andWhere('scan.scannedAt >= :startDate', { startDate: filter.startDate });
    }
    if (filter?.endDate) {
      qb.andWhere('scan.scannedAt <= :endDate', { endDate: filter.endDate });
    }

    const rawData = await qb.getRawMany();
    const hourMap = new Map<number, number>();
    for (const row of rawData) {
      hourMap.set(parseInt(row.hour, 10), parseInt(row.count, 10));
    }
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: hourMap.get(h) ?? 0 }));
  }

  async getUsers(pagination: PaginationDto): Promise<UserListDto> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepository.findAndCount({
      order: { [sortBy]: sortOrder },
      take: limit,
      skip,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getScans(pagination: PaginationDto, filter: AnalyticsFilterDto): Promise<ScanListDto> {
    const { page = 1, limit = 50, sortBy = 'scannedAt', sortOrder = 'DESC' } = pagination;
    const { startDate, endDate, query } = filter;
    const skip = (page - 1) * limit;

    const qb = this.scanRepository
      .createQueryBuilder('scan')
      .leftJoinAndSelect('scan.user', 'user')
      .orderBy(`scan.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    if (startDate) qb.andWhere('scan.scannedAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('scan.scannedAt <= :endDate', { endDate });
    if (query) {
      qb.andWhere('(scan.barcodeData ILIKE :query OR user.email ILIKE :query)', {
        query: `%${query}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  private calcGrowthPercent(current: number, prior: number): number | null {
    if (prior === 0) return current > 0 ? 100 : null;
    return parseFloat((((current - prior) / prior) * 100).toFixed(1));
  }

  private async fetchFirstScanPerUser(): Promise<{ userId: string; firstScan: Date }[]> {
    return this.scanRepository
      .createQueryBuilder('scan')
      .select('scan.userId', 'userId')
      .addSelect('MIN(scan.scannedAt)', 'firstScan')
      .groupBy('scan.userId')
      .getRawMany();
  }

  private async fetchWeeklyActivity(
    numWeeks: number,
  ): Promise<{ userId: string; weekStart: Date }[]> {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - numWeeks * 7);
    return this.scanRepository
      .createQueryBuilder('scan')
      .select('scan.userId', 'userId')
      .addSelect("DATE_TRUNC('week', scan.scannedAt)", 'weekStart')
      .where('scan.scannedAt >= :windowStart', { windowStart })
      .groupBy("scan.userId, DATE_TRUNC('week', scan.scannedAt)")
      .getRawMany();
  }
}
