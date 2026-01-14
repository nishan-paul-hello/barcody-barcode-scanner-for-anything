import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'api_metrics' })
@Index('idx_api_metrics_timestamp', ['timestamp'])
export class ApiMetrics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  endpoint!: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ type: 'integer', default: 0 })
  response_time!: number;

  @Column({ type: 'integer' })
  status_code!: number;

  @CreateDateColumn()
  timestamp!: Date;
}
