import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'error_stats' })
@Index('idx_error_stats_date', ['date'])
export class ErrorStats {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 100 })
  error_type!: string;

  @Column({ type: 'integer', default: 0 })
  count!: number;

  @Column({ type: 'varchar', length: 50 })
  device_type!: string;

  @CreateDateColumn()
  created_at!: Date;
}
