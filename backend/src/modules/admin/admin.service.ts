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
  RetentionCohortWeekDto,
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
    const userWeekMap = this.buildUserWeekMap(weeklyActivity);
    const cohortMap = this.buildCohortMap(firstScanRows);
    const weekStarts = this.buildWeekStartsList(numWeeks);

    const cohorts = this.buildCohortRows(weekStarts, cohortMap, userWeekMap);
    return { cohorts };
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

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

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

  private buildUserWeekMap(rows: { userId: string; weekStart: Date }[]): Map<string, Set<number>> {
    const map = new Map<string, Set<number>>();
    for (const row of rows) {
      const ts = new Date(row.weekStart).getTime();
      if (!map.has(row.userId)) map.set(row.userId, new Set());
      map.get(row.userId)!.add(ts);
    }
    return map;
  }

  private buildCohortMap(
    firstScanRows: { userId: string; firstScan: Date }[],
  ): Map<number, Set<string>> {
    const map = new Map<number, Set<string>>();
    for (const { userId, firstScan } of firstScanRows) {
      const ws = this.getWeekStart(new Date(firstScan));
      const ts = ws.getTime();
      if (!map.has(ts)) map.set(ts, new Set());
      map.get(ts)!.add(userId);
    }
    return map;
  }

  /** Returns ISO-week Monday 00:00:00 UTC for the given date. */
  private getWeekStart(d: Date): Date {
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const result = new Date(d);
    result.setUTCDate(d.getUTCDate() + diff);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  }

  private buildWeekStartsList(numWeeks: number): Date[] {
    const now = new Date();
    const weeks: Date[] = [];
    for (let i = numWeeks - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i * 7);
      weeks.push(this.getWeekStart(d));
    }
    return weeks;
  }

  private buildCohortRows(
    weekStarts: Date[],
    cohortMap: Map<number, Set<string>>,
    userWeekMap: Map<string, Set<number>>,
  ): RetentionCohortWeekDto[] {
    const cohorts: RetentionCohortWeekDto[] = [];

    for (let wi = 0; wi < weekStarts.length; wi++) {
      const cohortWeek = weekStarts[wi];
      if (!cohortWeek) continue;

      const cohortUsers = cohortMap.get(cohortWeek.getTime());
      if (!cohortUsers || cohortUsers.size === 0) continue;

      const retention = this.calcRetentionRow(wi, weekStarts, cohortUsers, userWeekMap);

      cohorts.push({
        weekStart: cohortWeek.toISOString(),
        newUsers: cohortUsers.size,
        retention,
      });
    }

    return cohorts;
  }

  private calcRetentionRow(
    cohortIndex: number,
    weekStarts: Date[],
    cohortUsers: Set<string>,
    userWeekMap: Map<string, Set<number>>,
  ): number[] {
    const retention: number[] = [100]; // Week 0 is always 100%
    const remainingWeeks = weekStarts.length - cohortIndex - 1;

    for (let offset = 1; offset <= remainingWeeks; offset++) {
      const targetWeek = weekStarts[cohortIndex + offset];
      if (!targetWeek) break;

      const targetTs = targetWeek.getTime();
      let retained = 0;
      for (const userId of cohortUsers) {
        const weeks = userWeekMap.get(userId);
        if (weeks?.has(targetTs)) retained++;
      }

      retention.push(parseFloat(((retained / cohortUsers.size) * 100).toFixed(1)));
    }

    return retention;
  }
}
