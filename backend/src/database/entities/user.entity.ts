import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Session } from '@database/entities/session.entity';
import { Scan } from '@database/entities/scan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_users_google_id', { unique: true }) // Fast lookup for OAuth login
  @Column({ name: 'google_id', unique: true })
  googleId!: string;

  @Column({ unique: true })
  email!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Scan, (scan) => scan.user)
  scans!: Scan[];
}
