import { Controller, Get, Query, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { ExportService } from './export.service';
import { ExportQueryDto } from './dto/export-query.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  @ApiOperation({ summary: 'Export scans as CSV' })
  @ApiResponse({ status: 200, description: 'Streamed CSV file' })
  async exportCsv(
    @CurrentUser('sub') userId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`Exporting CSV for user ${userId}`);

    const filename = `scans-export-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    try {
      const stream = await this.exportService.getCsvStream(userId, query);

      stream.on('error', (error) => {
        this.logger.error(`Error in CSV stream: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error generating export' });
        } else {
          res.end();
        }
      });

      stream.pipe(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initiate CSV export: ${errorMessage}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to initiate export' });
      }
    }
  }

  @Get('json')
  @ApiOperation({ summary: 'Export scans as JSON' })
  @ApiResponse({ status: 200, description: 'Streamed JSON file' })
  async exportJson(
    @CurrentUser('sub') userId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`Exporting JSON for user ${userId}`);

    const filename = `scans-export-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    try {
      const stream = await this.exportService.getJsonStream(userId, query);

      stream.on('error', (error) => {
        this.logger.error(`Error in JSON stream: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error generating export' });
        } else {
          res.end();
        }
      });

      stream.pipe(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initiate JSON export: ${errorMessage}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to initiate export' });
      }
    }
  }
}
