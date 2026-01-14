import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { ScansService } from '@modules/scans/scans.service';
import { CreateScanDto } from '@modules/scans/dto/create-scan.dto';
import { BulkCreateScansDto } from '@modules/scans/dto/bulk-create-scans.dto';
import { ScanQueryDto } from '@modules/scans/dto/scan-query.dto';
import { BulkDeleteScansDto } from '@modules/scans/dto/bulk-delete-scans.dto';
import { Scan } from '@database/entities/scan.entity';

@ApiTags('scans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scans')
export class ScansController {
  private readonly logger = new Logger(ScansController.name);

  constructor(private readonly scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scan' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Scan created successfully', type: Scan })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createScanDto: CreateScanDto,
  ): Promise<Scan> {
    this.logger.log(`User ${userId} creating scan: ${createScanDto.barcodeData}`);
    return this.scansService.create(userId, createScanDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create scans' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Scans created successfully' })
  async bulkCreate(@CurrentUser('sub') userId: string, @Body() bulkCreateDto: BulkCreateScansDto) {
    this.logger.log(`User ${userId} bulk creating ${bulkCreateDto.scans.length} scans`);
    const { scans } = bulkCreateDto;

    // Deduplication logic: same barcode + timestamp within 1 minute
    const uniqueScans: CreateScanDto[] = [];
    const seen = new Set<string>();

    for (const scan of scans) {
      const timestamp = scan.scannedAt ? new Date(scan.scannedAt).getTime() : Date.now();
      const roundedTimestamp = Math.floor(timestamp / 60000); // 1 minute window
      const key = `${scan.barcodeData}:${roundedTimestamp}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueScans.push(scan);
      }
    }

    const createdScans = await this.scansService.bulkCreate(userId, uniqueScans);
    return {
      count: createdScans.length,
      scans: createdScans,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List scans with filters and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of scans' })
  async findAll(@CurrentUser('sub') userId: string, @Query() query: ScanQueryDto) {
    return this.scansService.findAll(userId, query);
  }

  @Get('since/:timestamp')
  @ApiOperation({ summary: 'Incremental sync: Get scans since timestamp' })
  @ApiParam({ name: 'timestamp', description: 'ISO 8601 timestamp' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of scans since timestamp' })
  async findSince(
    @CurrentUser('sub') userId: string,
    @Param('timestamp') timestamp: string,
    @Query() query: ScanQueryDto,
  ) {
    return this.scansService.findAllSince(userId, timestamp, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scan by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Scan data', type: Scan })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Scan not found' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Scan> {
    return this.scansService.findOne(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scan' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Scan deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Scan not found' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.scansService.delete(userId, id);
  }

  @Delete('batch')
  @ApiOperation({ summary: 'Batch delete scans' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Scans deleted successfully' })
  async bulkRemove(
    @CurrentUser('sub') userId: string,
    @Body() bulkDeleteDto: BulkDeleteScansDto,
  ): Promise<{ count: number }> {
    return this.scansService.bulkDelete(userId, bulkDeleteDto.ids);
  }
}
