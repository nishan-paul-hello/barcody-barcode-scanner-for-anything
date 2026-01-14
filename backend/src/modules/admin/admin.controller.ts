import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  AnalyticsOverviewDto,
  TrendDataDto,
  BarcodeTypeDistributionDto,
  DeviceDistributionDto,
} from './dto/analytics-response.dto';
import { UserListDto, ScanListDto } from './dto/list-response.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get total scans, users, and active today counts' })
  @ApiResponse({ type: AnalyticsOverviewDto })
  async getOverview(): Promise<AnalyticsOverviewDto> {
    return this.adminService.getOverview();
  }

  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get daily scans trend with date range filter' })
  @ApiResponse({ type: TrendDataDto })
  async getTrends(@Query() filter: AnalyticsFilterDto): Promise<TrendDataDto> {
    return this.adminService.getTrends(filter);
  }

  @Get('analytics/barcode-types')
  @ApiOperation({ summary: 'Get barcode type distribution' })
  @ApiResponse({ type: [BarcodeTypeDistributionDto] })
  async getBarcodeTypes(): Promise<BarcodeTypeDistributionDto[]> {
    return this.adminService.getBarcodeTypes();
  }

  @Get('analytics/devices')
  @ApiOperation({ summary: 'Get device breakdown' })
  @ApiResponse({ type: [DeviceDistributionDto] })
  async getDevices(): Promise<DeviceDistributionDto[]> {
    return this.adminService.getDevices();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user list with pagination' })
  @ApiResponse({ type: UserListDto })
  async getUsers(@Query() pagination: PaginationDto): Promise<UserListDto> {
    return this.adminService.getUsers(pagination);
  }

  @Get('scans')
  @ApiOperation({ summary: 'Get all scans across users with filters' })
  @ApiResponse({ type: ScanListDto })
  async getScans(
    @Query() pagination: PaginationDto,
    @Query() filter: AnalyticsFilterDto,
  ): Promise<ScanListDto> {
    return this.adminService.getScans(pagination, filter);
  }
}
