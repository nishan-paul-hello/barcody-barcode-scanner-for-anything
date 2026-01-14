import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'usage_stats' })
@Index('idx_usage_stats_date', ['date'])
export class UsageStats {
  @PrimaryColumn({ type: 'date' })
  date!: string;

  @Column({ type: 'integer', default: 0 })
  total_scans!: number;

  @Column({ type: 'integer', default: 0 })
  active_users!: number;

  @Column({ type: 'integer', default: 0 })
  new_users!: number;

  @CreateDateColumn()
  created_at!: Date;
}
