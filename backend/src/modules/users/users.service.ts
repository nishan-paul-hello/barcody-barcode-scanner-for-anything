import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@/database/entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findOrCreateByGoogleId(googleInfo: { googleId: string; email: string }): Promise<User> {
    const { googleId, email } = googleInfo;

    return await this.dataSource.transaction(async (manager) => {
      let user = await manager.findOne(User, {
        where: { googleId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.log(`Creating new user with googleId: ${googleId}`);
        user = manager.create(User, {
          googleId,
          email,
          lastLogin: new Date(),
        });
        user = await manager.save(User, user);
      } else {
        this.logger.log(`Updating last login for user: ${googleId}`);
        user.lastLogin = new Date();
        user = await manager.save(User, user);
      }

      return user;
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }
}
