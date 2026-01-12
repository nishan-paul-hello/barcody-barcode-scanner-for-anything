import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Scan } from '@database/entities/scan.entity';
import { ExportQueryDto } from './dto/export-query.dto';
import { Transform, Readable } from 'stream';
import { Parser } from 'json2csv';
import * as JSONStream from 'JSONStream';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {
  ExportStats,
  drawPdfHeader,
  drawPdfStats,
  drawPdfFooter,
  getLineChartConfig,
  getPieChartConfig,
} from './export.utils';

// Local type for service implementation
type LocalExportStats = ExportStats;

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private chartCanvas: ChartJSNodeCanvas | null = null;

  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
  ) {}

  private getChartCanvas(): ChartJSNodeCanvas {
    if (!this.chartCanvas) {
      this.chartCanvas = new ChartJSNodeCanvas({
        width: 800,
        height: 400,
        backgroundColour: 'white',
      });
    }
    return this.chartCanvas;
  }

  private createQueryBuilder(userId: string, query: ExportQueryDto): SelectQueryBuilder<Scan> {
    const { search, barcodeType, deviceType, startDate, endDate, sortBy, order } = query;
    const queryBuilder = this.scanRepository.createQueryBuilder('scan');
    queryBuilder.where('scan.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere('scan.barcodeData ILIKE :search', { search: `%${search}%` });
    }
    if (barcodeType) {
      queryBuilder.andWhere('scan.barcodeType = :barcodeType', { barcodeType });
    }
    if (deviceType) {
      queryBuilder.andWhere('scan.deviceType = :deviceType', { deviceType });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('scan.scannedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('scan.scannedAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('scan.scannedAt <= :endDate', { endDate });
    }

    queryBuilder.orderBy(`scan.${sortBy || 'scannedAt'}`, order || 'DESC');
    return queryBuilder;
  }

  async getCsvStream(userId: string, query: ExportQueryDto): Promise<Readable> {
    const dbStream = await this.createQueryBuilder(userId, query).stream();
    const csvTransform = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const row = {
          id: chunk.scan_id,
          barcodeData: chunk.scan_barcode_data,
          barcodeType: chunk.scan_barcode_type,
          scannedAt: chunk.scan_scanned_at,
          deviceType: chunk.scan_device_type,
          metadata:
            typeof chunk.scan_metadata === 'string'
              ? chunk.scan_metadata
              : JSON.stringify(chunk.scan_metadata),
        };
        const parser = new Parser({ fields: Object.keys(row), header: !this.readableLength });
        callback(null, `${parser.parse([row])}\n`);
      },
    });
    return dbStream.pipe(csvTransform);
  }

  async getJsonStream(userId: string, query: ExportQueryDto): Promise<Readable> {
    const dbStream = await this.createQueryBuilder(userId, query).stream();
    const jsonTransform = new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        callback(null, {
          id: chunk.scan_id,
          barcodeData: chunk.scan_barcode_data,
          barcodeType: chunk.scan_barcode_type,
          scannedAt: chunk.scan_scanned_at,
          deviceType: chunk.scan_device_type,
          metadata:
            typeof chunk.scan_metadata === 'string'
              ? JSON.parse(chunk.scan_metadata)
              : chunk.scan_metadata,
        });
      },
    });
    const stringify = JSONStream.stringify('[', ',', ']');
    return dbStream.pipe(jsonTransform).pipe(stringify) as unknown as Readable;
  }

  async generatePdf(userId: string, query: ExportQueryDto): Promise<Buffer> {
    const scans = await this.createQueryBuilder(userId, query).getMany();
    const stats = this.aggregateStats(scans);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));
    });

    try {
      drawPdfHeader(doc);
      drawPdfStats(doc, stats);

      if (scans.length > 0) {
        const canvas = this.getChartCanvas();

        try {
          const lineChart = await canvas.renderToBuffer(getLineChartConfig(stats, '#00D9FF'));
          doc.image(Buffer.from(lineChart), 50, 220, { width: 450 });
        } catch (chartErr: unknown) {
          const msg = chartErr instanceof Error ? chartErr.message : String(chartErr);
          this.logger.warn(`Failed to generate line chart: ${msg}`);
          doc.text('Chart generation skipped due to error.', 50, 220);
        }

        try {
          const pieChart = await canvas.renderToBuffer(getPieChartConfig(stats));
          doc.addPage().image(Buffer.from(pieChart), 50, 50, { width: 450 });
        } catch (chartErr: unknown) {
          const msg = chartErr instanceof Error ? chartErr.message : String(chartErr);
          this.logger.warn(`Failed to generate pie chart: ${msg}`);
          doc.addPage().text('Chart generation skipped due to error.', 50, 50);
        }

        this.drawPdfTable(doc, scans);
      } else {
        doc.moveDown(10);
        doc
          .fontSize(14)
          .fillColor('gray')
          .text('No scan data found for the selected criteria.', { align: 'center' });
      }

      drawPdfFooter(doc);
      doc.end();
      return pdfPromise;
    } catch (err) {
      doc.end();
      throw err;
    }
  }

  async generateExcel(userId: string, query: ExportQueryDto): Promise<Buffer> {
    const scans = await this.createQueryBuilder(userId, query).getMany();
    const stats = this.aggregateStats(scans);

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Scans');

    sheet.columns = [
      { header: 'Barcode', key: 'b', width: 30 },
      { header: 'Type', key: 't', width: 15 },
      { header: 'Date', key: 'd', width: 20 },
      { header: 'Device', key: 'dv', width: 15 },
    ];

    scans.forEach((s) =>
      sheet.addRow({
        b: s.barcodeData,
        t: s.barcodeType,
        d: s.scannedAt.toISOString(),
        dv: s.deviceType,
      }),
    );

    if (scans.length > 0) {
      const chartSheet = wb.addWorksheet('Charts');
      const canvas = this.getChartCanvas();

      try {
        const lineImg = await canvas.renderToBuffer(getLineChartConfig(stats, '#00D9FF'));
        const imgId = wb.addImage({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          buffer: lineImg as any,
          extension: 'png',
        });
        chartSheet.addImage(imgId, 'B2:L20');
      } catch (chartErr: unknown) {
        const msg = chartErr instanceof Error ? chartErr.message : String(chartErr);
        this.logger.warn(`Failed to add charts to Excel: ${msg}`);
        chartSheet.getCell('B2').value = `Chart generation failed: ${msg}`;
      }
    }

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf as ArrayBuffer);
  }

  private drawPdfTable(doc: PDFKit.PDFDocument, scans: Scan[]) {
    doc.addPage().fontSize(18).text('Scan Details (First 100)', 50, 50);
    let y = 80;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 50, y);
    doc.text('Barcode', 150, y);
    doc.text('Type', 350, y);
    doc.font('Helvetica');
    y += 20;

    scans.slice(0, 100).forEach((s) => {
      // Check for page break
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, y);
        doc.text('Barcode', 150, y);
        doc.text('Type', 350, y);
        doc.font('Helvetica');
        y += 20;
      }

      doc.text(s.scannedAt.toLocaleDateString(), 50, y);
      doc.text(s.barcodeData.substring(0, 30), 150, y);
      doc.text(s.barcodeType || 'N/A', 350, y);
      y += 15;
    });
  }

  private aggregateStats(scans: Scan[]): LocalExportStats {
    const bDist: Record<string, number> = {};
    const dDist: Record<string, number> = {};
    const sPerDay: Record<string, number> = {};

    scans.forEach((s) => {
      this.updateDistribution(bDist, s.barcodeType);
      this.updateDistribution(dDist, s.deviceType);
      this.updateDateDistribution(sPerDay, s.scannedAt);
    });

    const days = Object.keys(sPerDay).sort();

    return {
      total: scans.length,
      barcodeTypeDist: bDist,
      deviceTypeDist: dDist,
      scansOverTime: {
        labels: days.length > 0 ? days : ['No Data'],
        data: days.length > 0 ? days.map((d) => sPerDay[d] || 0) : [0],
      },
      dateRange: this.calculateDateRange(scans),
    };
  }

  private updateDistribution(dist: Record<string, number>, value: string | undefined | null) {
    const key = String(value || 'Unknown');
    dist[key] = (dist[key] || 0) + 1;
  }

  private updateDateDistribution(dist: Record<string, number>, date: Date) {
    try {
      const key = date.toISOString().split('T')[0]!;
      dist[key] = (dist[key] || 0) + 1;
    } catch (_e) {
      dist['invalid-date'] = (dist['invalid-date'] || 0) + 1;
    }
  }

  private calculateDateRange(scans: Scan[]) {
    if (scans.length === 0) {
      return { start: 'N/A', end: 'N/A' };
    }
    return {
      start: scans[scans.length - 1]?.scannedAt?.toLocaleDateString() || 'N/A',
      end: scans[0]?.scannedAt?.toLocaleDateString() || 'N/A',
    };
  }
}
