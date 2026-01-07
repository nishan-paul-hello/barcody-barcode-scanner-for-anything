import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BarcodeType } from '../../common/enums/barcode-type.enum';
import { DeviceType } from '../../common/enums/device-type.enum';

@Entity('scans')
@Index('idx_scans_user_id_scanned_at', ['userId', 'scannedAt']) // Optimized for fetching user scan history ordered by date
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_scans_barcode_data') // Optimized for looking up products by barcode across all scans
  @Column({ name: 'barcode_data' })
  barcodeData!: string;

  @Column({
    name: 'barcode_type',
    type: 'enum',
    enum: BarcodeType,
    default: BarcodeType.UNKNOWN,
  })
  barcodeType!: BarcodeType;

  @Column({ name: 'raw_data', type: 'text' })
  rawData!: string;

  @CreateDateColumn({ name: 'scanned_at', type: 'timestamptz' })
  scannedAt!: Date;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType,
  })
  deviceType!: DeviceType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
