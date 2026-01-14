import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ schema: 'analytics', name: 'user_behavior' })
@Index('idx_user_behavior_hashed_id', ['hashed_user_id'])
export class UserBehavior {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 64 })
  hashed_user_id!: string;

  @Column({ type: 'integer', default: 0 })
  session_length!: number;

  @Column({ type: 'float', default: 0 })
  scan_frequency!: number;

  @Column({ type: 'integer', default: 0 })
  retention_day!: number;

  @CreateDateColumn()
  created_at!: Date;
}
