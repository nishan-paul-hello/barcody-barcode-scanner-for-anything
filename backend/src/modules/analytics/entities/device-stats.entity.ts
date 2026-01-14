import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'analytics', name: 'device_stats' })
export class DeviceStats {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  device_model!: string;

  @Column({ type: 'varchar', length: 50 })
  os_version!: string;

  @Column({ type: 'text', nullable: true })
  camera_specs!: string; // Using ! even if nullable column, logic handles nulls, TS needs to know it's a string (or string | null)

  @Column({ type: 'integer', default: 0 })
  scan_count!: number;

  @Column({ type: 'float', default: 0 })
  avg_fps!: number;

  @CreateDateColumn()
  created_at!: Date;
}
