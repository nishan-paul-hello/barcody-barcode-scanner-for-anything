import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ScansService } from '@/modules/scans/scans.service';
import { Scan } from '@database/entities/scan.entity';
import { User } from '@database/entities/user.entity';
import { Session } from '@database/entities/session.entity';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '@/config/database.config';
import { envSchema } from '@/config/env.schema';

import { join } from 'path';

jest.setTimeout(30000);

describe('ScansService (Integration)', () => {
  let service: ScansService;
  let dataSource: DataSource;
  let testUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [join(__dirname, '../../.env.test')],
          validationSchema: envSchema,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...getDatabaseConfig(configService),
            synchronize: true,
            entities: [Scan, User, Session],
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Scan, User, Session]),
      ],
      providers: [ScansService],
    }).compile();

    service = module.get<ScansService>(ScansService);
    dataSource = module.get<DataSource>(DataSource);

    // Initial cleanup
    await dataSource.query('DELETE FROM scans');
    await dataSource.query('DELETE FROM sessions');
    await dataSource.query('DELETE FROM users');

    // Setup test user
    const userRepository = dataSource.getRepository(User);
    testUser = userRepository.create({
      googleId: 'test-user-123',
      email: 'test@example.com',
    });
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      // Cleanup
      await dataSource.query('DELETE FROM scans');
      await dataSource.query('DELETE FROM sessions');
      await dataSource.query('DELETE FROM users');
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM scans');
  });

  it('should create and find scans', async () => {
    const dto = {
      barcodeData: '123456789',
      barcodeType: BarcodeType.EAN13,
      rawData: '123456789',
      deviceType: DeviceType.MOBILE,
      metadata: { location: 'Store A' },
    };

    const created = await service.create(testUser.id, dto);
    expect(created.id).toBeDefined();
    expect(created.barcodeData).toBe(dto.barcodeData);

    const found = await service.findAll(testUser.id, { page: 1, limit: 10 });
    expect(found.items.length).toBe(1);
    expect(found.items[0]?.id).toBe(created.id);
  });

  it('should not allow access to other users scans', async () => {
    const userRepository = dataSource.getRepository(User);
    const otherUser = await userRepository.save(
      userRepository.create({
        googleId: 'other-user',
        email: 'other@example.com',
      }),
    );

    await service.create(otherUser.id, {
      barcodeData: 'other-barcode',
      barcodeType: BarcodeType.QR,
      rawData: 'other-raw',
      deviceType: DeviceType.WEB,
    });

    const testUserScans = await service.findAll(testUser.id, {
      page: 1,
      limit: 10,
    });
    expect(testUserScans.items.length).toBe(0);
  });

  it('should bulk create scans in a transaction', async () => {
    const dtos = [
      {
        barcodeData: 'b1',
        barcodeType: BarcodeType.EAN13,
        rawData: 'r1',
        deviceType: DeviceType.WEB,
      },
      {
        barcodeData: 'b2',
        barcodeType: BarcodeType.EAN8,
        rawData: 'r2',
        deviceType: DeviceType.MOBILE,
      },
    ];

    const results = await service.bulkCreate(testUser.id, dtos);
    expect(results.length).toBe(2);

    const count = await dataSource.getRepository(Scan).count();
    expect(count).toBe(2);
  });

  it('should rollback on error in bulk create', async () => {
    const dtos = [
      {
        barcodeData: 'b1',
        barcodeType: BarcodeType.EAN13,
        rawData: 'r1',
        deviceType: DeviceType.WEB,
      },
      {
        barcodeData: null as any, // This should cause an error
        barcodeType: BarcodeType.EAN8,
        rawData: 'r2',
        deviceType: DeviceType.MOBILE,
      },
    ];

    await expect(service.bulkCreate(testUser.id, dtos)).rejects.toThrow();

    const count = await dataSource.getRepository(Scan).count();
    expect(count).toBe(0);
  });
});
