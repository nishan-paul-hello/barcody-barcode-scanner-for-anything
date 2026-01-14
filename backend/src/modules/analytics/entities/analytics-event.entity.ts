import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('analytics_events')
@Index(['event_type'])
@Index(['timestamp'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  event_type!: string;

  @Column()
  user_id!: string;

  @Column('jsonb', { nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @CreateDateColumn()
  created_at!: Date;
}
