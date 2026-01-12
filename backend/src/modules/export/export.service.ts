import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Scan } from '@database/entities/scan.entity';
import { ExportQueryDto } from './dto/export-query.dto';
import { Transform, Readable } from 'stream';
import { Parser } from 'json2csv';
import * as JSONStream from 'JSONStream';

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

    // Default sorting if not provided correctly
    const sortField = sortBy || 'scannedAt';
    const sortOrder = order || 'DESC';
    queryBuilder.orderBy(`scan.${sortField}`, sortOrder);

    return queryBuilder;
  }

  async getCsvStream(userId: string, query: ExportQueryDto): Promise<Readable> {
    const queryBuilder = this.createQueryBuilder(userId, query);
    const dbStream = await queryBuilder.stream();

    const fields = ['id', 'barcodeData', 'barcodeType', 'scannedAt', 'deviceType', 'metadata'];
    const opts = { fields };

    let isFirst = true;

    const csvTransform = new Transform({
      objectMode: true,
      transform(chunk, _encoding, callback) {
        try {
          // TypeORM stream returns keys like scan_id, scan_barcode_data (using column names)
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

          const parser = new Parser({ ...opts, header: isFirst });
          const csv = parser.parse([row]);

          if (isFirst) {
            this.push(`${csv}\n`);
            isFirst = false;
          } else {
            this.push(`${csv}\n`);
          }
          callback();
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          this.emit('error', error);
          callback(error);
        }
      },
    });

    return dbStream.pipe(csvTransform);
  }

  async getJsonStream(userId: string, query: ExportQueryDto): Promise<Readable> {
    const queryBuilder = this.createQueryBuilder(userId, query);
    const dbStream = await queryBuilder.stream();

    const jsonTransform = new Transform({
      objectMode: true,
      transform(chunk, _encoding, callback) {
        try {
          const item = {
            id: chunk.scan_id,
            barcodeData: chunk.scan_barcode_data,
            barcodeType: chunk.scan_barcode_type,
            scannedAt: chunk.scan_scanned_at,
            deviceType: chunk.scan_device_type,
            metadata:
              typeof chunk.scan_metadata === 'string'
                ? JSON.parse(chunk.scan_metadata)
                : chunk.scan_metadata,
          };
          callback(null, item);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          callback(error);
        }
      },
    });

    const stringify = JSONStream.stringify('[', ',', ']');

    return dbStream.pipe(jsonTransform).pipe(stringify) as unknown as Readable;
  }
}
