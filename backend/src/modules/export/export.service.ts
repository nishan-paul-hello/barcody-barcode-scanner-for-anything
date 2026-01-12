import { Injectable } from '@nestjs/common';
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
import { ChartConfiguration } from 'chart.js';

interface ExportStats {
  total: number;
  barcodeTypeDist: Record<string, number>;
  deviceTypeDist: Record<string, number>;
  scansOverTime: {
    labels: string[];
    data: number[];
  };
  dateRange: {
    start: string;
    end: string;
  };
}

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>,
  ) {}

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
    doc.on('data', (c) => chunks.push(c));
    const pdfPromise = new Promise<Buffer>((res) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.on('end', () => res(Buffer.concat(chunks) as any)),
    );

    this.drawPdfHeader(doc);
    this.drawPdfStats(doc, stats);

    const canvas = new ChartJSNodeCanvas({ width: 500, height: 300, backgroundColour: 'white' });
    const lineChart = await canvas.renderToBuffer(this.getLineChartConfig(stats, '#00D9FF'));
    doc.image(lineChart, 50, 220, { width: 450 });

    const pieChart = await canvas.renderToBuffer(this.getPieChartConfig(stats));
    doc.addPage().image(pieChart, 50, 50, { width: 450 });

    this.drawPdfTable(doc, scans);
    this.drawPdfFooter(doc);

    doc.end();
    return pdfPromise;
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
      sheet.addRow({ b: s.barcodeData, t: s.barcodeType, d: s.scannedAt, dv: s.deviceType }),
    );

    const canvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' });
    const lineImg = await canvas.renderToBuffer(this.getLineChartConfig(stats, '#00D9FF'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgId = wb.addImage({ buffer: lineImg as any, extension: 'png' });
    wb.addWorksheet('Charts').addImage(imgId, 'B2:L20');

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf as ArrayBuffer);
  }

  private aggregateStats(scans: Scan[]) {
    const bDist: Record<string, number> = {};
    const dDist: Record<string, number> = {};
    const sPerDay: Record<string, number> = {};

    scans.forEach((s) => {
      const t = String(s.barcodeType || 'Unknown');
      bDist[t] = (bDist[t] || 0) + 1;
      const d = String(s.deviceType || 'Unknown');
      dDist[d] = (dDist[d] || 0) + 1;
      const date = s.scannedAt.toISOString().split('T')[0]!;
      sPerDay[date] = (sPerDay[date] || 0) + 1;
    });

    const days = Object.keys(sPerDay).sort();
    return {
      total: scans.length,
      barcodeTypeDist: bDist,
      deviceTypeDist: dDist,
      scansOverTime: { labels: days, data: days.map((d) => sPerDay[d] || 0) },
      dateRange: {
        start: scans[scans.length - 1]?.scannedAt.toLocaleDateString() || 'N/A',
        end: scans[0]?.scannedAt.toLocaleDateString() || 'N/A',
      },
    } as ExportStats;
  }

  private drawPdfHeader(doc: PDFKit.PDFDocument) {
    doc.rect(0, 0, doc.page.width, 100).fill('#0A1929');
    doc.fillColor('#00D9FF').fontSize(24).text('BARCODY', 50, 30);
    doc.fillColor('#FFFFFF').fontSize(14).text('Scan Export Report', 50, 60);
    doc.fillColor('#000000');
  }

  private drawPdfStats(doc: PDFKit.PDFDocument, stats: ExportStats) {
    doc.fontSize(18).text('Summary Statistics', 50, 120);
    doc.fontSize(12).text(`Total Scans: ${stats.total}`, 50, 150);
    doc.text(`Date Range: ${stats.dateRange.start} - ${stats.dateRange.end}`);
  }

  private drawPdfTable(doc: PDFKit.PDFDocument, scans: Scan[]) {
    doc.addPage().fontSize(18).text('Scan Details', 50, 50);
    let y = 80;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 50, y);
    doc.text('Barcode', 150, y);
    doc.text('Type', 350, y);
    doc.font('Helvetica');
    y += 20;

    scans.slice(0, 50).forEach((s) => {
      doc.text(s.scannedAt.toLocaleDateString(), 50, y);
      doc.text(s.barcodeData.substring(0, 30), 150, y);
      doc.text(s.barcodeType || 'N/A', 350, y);
      y += 15;
    });
  }

  private drawPdfFooter(doc: PDFKit.PDFDocument) {
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('grey')
        .text(`Page ${i + 1} of ${pages}`, 0, doc.page.height - 30, {
          align: 'center',
        });
    }
  }

  private getLineChartConfig(stats: ExportStats, color: string): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: stats.scansOverTime.labels,
        datasets: [
          { label: 'Scans', data: stats.scansOverTime.data, borderColor: color, fill: false },
        ],
      },
    };
  }

  private getPieChartConfig(stats: ExportStats): ChartConfiguration {
    return {
      type: 'pie',
      data: {
        labels: Object.keys(stats.barcodeTypeDist),
        datasets: [
          { data: Object.values(stats.barcodeTypeDist), backgroundColor: ['#0080FF', '#00D9FF'] },
        ],
      },
    };
  }
}
