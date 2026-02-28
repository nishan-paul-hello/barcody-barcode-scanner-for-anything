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

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findOrCreateByGoogleId(googleInfo: { googleId: string; email: string }): Promise<User> {
    const { googleId, email } = googleInfo;

    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { googleId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.log(`Creating new user with googleId: ${googleId}`);
        const newUser = manager.create(User, {
          googleId,
          email,
          lastLogin: new Date(),
        });
        return await manager.save(User, newUser);
      } else {
        this.logger.log(`Updating last login for user: ${googleId}`);
        user.lastLogin = new Date();
        return await manager.save(User, user);
      }
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  async getApiKeys(userId: string): Promise<{
    upcDatabaseApiKey: string | null;
    usdaFoodDataApiKey: string | null;
    goUpcApiKey: string | null;
    searchUpcApiKey: string | null;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      upcDatabaseApiKey: user.upcDatabaseApiKey || null,
      usdaFoodDataApiKey: user.usdaFoodDataApiKey || null,
      goUpcApiKey: user.goUpcApiKey || null,
      searchUpcApiKey: user.searchUpcApiKey || null,
    };
  }

  async updateApiKeys(
    userId: string,
    keys: {
      upcDatabaseApiKey?: string;
      usdaFoodDataApiKey?: string;
      goUpcApiKey?: string;
      searchUpcApiKey?: string;
    },
  ): Promise<void> {
    await this.userRepository.update(userId, {
      upcDatabaseApiKey: keys.upcDatabaseApiKey ?? null,
      usdaFoodDataApiKey: keys.usdaFoodDataApiKey ?? null,
      goUpcApiKey: keys.goUpcApiKey ?? null,
      searchUpcApiKey: keys.searchUpcApiKey ?? null,
    });
  }
}
