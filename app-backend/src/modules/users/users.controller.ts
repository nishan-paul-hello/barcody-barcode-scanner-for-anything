import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateApiKeysDto } from './dto/update-api-keys.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('api-keys')
  @ApiOperation({ summary: 'Get current user API keys' })
  getApiKeys(@CurrentUser('sub') userId: string) {
    return this.usersService.getApiKeys(userId);
  }

  @Put('api-keys')
  @ApiOperation({ summary: 'Update current user API keys' })
  async updateApiKeys(@CurrentUser('sub') userId: string, @Body() dto: UpdateApiKeysDto) {
    await this.usersService.updateApiKeys(userId, dto);
    return { success: true };
  }
}
