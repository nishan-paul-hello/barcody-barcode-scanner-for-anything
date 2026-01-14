import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'scan_metrics' })
@Index('idx_scan_metrics_date_type', ['date', 'barcode_type'])
export class ScanMetrics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 50 })
  barcode_type!: string;

  @Column({ type: 'integer', default: 0 })
  success_count!: number;

  @Column({ type: 'integer', default: 0 })
  error_count!: number;

  @Column({ type: 'float', default: 0 })
  avg_scan_time!: number;

  @CreateDateColumn()
  created_at!: Date;
}
