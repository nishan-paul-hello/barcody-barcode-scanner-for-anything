import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductLookupService } from '@modules/product-lookup/product-lookup.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AdminGuard } from '@modules/auth/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productLookupService: ProductLookupService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get product lookup statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return this.productLookupService.getStats();
  }

  @Get(':barcode')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @ApiOperation({ summary: 'Lookup product by barcode' })
  @ApiParam({ name: 'barcode', description: 'Barcode to lookup', example: '5449000000996' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
  })
  @ApiResponse({ status: 400, description: 'Invalid barcode format' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async lookup(@Param('barcode') barcode: string) {
    if (!barcode || barcode.length < 8) {
      throw new BadRequestException('Invalid barcode format');
    }

    const { data, cacheStatus } = await this.productLookupService.lookup(barcode);

    if (!data) {
      throw new NotFoundException({
        message: 'Product not found',
        barcode,
        cacheStatus,
      });
    }

    return {
      success: true,
      data,
      cacheStatus,
    };
  }
}
