import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Session } from './session.entity';
import { Scan } from './scan.entity';

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

  @Column({ name: 'upc_database_api_key', type: 'varchar', nullable: true })
  upcDatabaseApiKey?: string | null;

  @Column({ name: 'usda_food_data_api_key', type: 'varchar', nullable: true })
  usdaFoodDataApiKey?: string | null;

  @Column({ name: 'go_upc_api_key', type: 'varchar', nullable: true })
  goUpcApiKey?: string | null;

  @Column({ name: 'search_upc_api_key', type: 'varchar', nullable: true })
  searchUpcApiKey?: string | null;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Scan, (scan) => scan.user)
  scans!: Scan[];
}
