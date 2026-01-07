import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Scan } from '../entities/scan.entity';
import { BarcodeType } from '../../common/enums/barcode-type.enum';
import { DeviceType } from '../../common/enums/device-type.enum';
import { dataSourceOptions } from '../../config/typeorm.config';

const logger = new Logger('Seed');

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  logger.log('Seeding database...');

  const userRepository = dataSource.getRepository(User);
  const scanRepository = dataSource.getRepository(Scan);

  // Clear existing data
  await scanRepository.clear();
  await userRepository.query('TRUNCATE users CASCADE'); // Use TRUNCATE for users since it has foreign keys

  // Create User
  const user = userRepository.create({
    googleId: '123456789',
    email: 'admin@barcody.com',
    lastLogin: new Date(),
  });
  await userRepository.save(user);

  logger.log(`User seeded: ${user.email}`);

  // Create Scans
  const scans: Scan[] = [];
  const barcodeTypes = Object.values(BarcodeType).filter((t) => t !== BarcodeType.UNKNOWN);
  const deviceTypes = Object.values(DeviceType);

  for (let i = 0; i < 50; i++) {
    const scan = scanRepository.create({
      userId: user.id,
      barcodeData: Math.random().toString(36).substring(7).toUpperCase(),
      barcodeType: barcodeTypes[i % barcodeTypes.length],
      rawData: `Raw data for scan ${i}`,
      scannedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // Random date in last 30 days
      deviceType: deviceTypes[i % deviceTypes.length],
      metadata: {
        location: 'New York',
        ip: `192.168.1.${i}`,
        batch: i < 25 ? 'A' : 'B',
      },
    });
    scans.push(scan);
  }

  await scanRepository.save(scans);
  logger.log(`Seeded ${scans.length} scans.`);

  await dataSource.destroy();
  logger.log('Seeding complete.');
}

seed().catch((error) => {
  logger.error('Error seeding database:', error);
  process.exit(1);
});
