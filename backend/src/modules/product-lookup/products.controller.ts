import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  BadRequestException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import {
  ProductLookupService,
  ProductComparison,
} from '@modules/product-lookup/product-lookup.service';
import { ProductInfo } from '@modules/product-lookup/interfaces/product-info.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AdminGuard } from '@modules/auth/guards/admin.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CompareProductsDto } from './dto/compare-products.dto';

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

  @Get(':barcode/raw/:source')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get raw data from a specific API source (Proxy)' })
  @ApiParam({ name: 'barcode', description: 'Barcode to lookup' })
  @ApiParam({
    name: 'source',
    description: 'API source (off, obf, usda, upcitemdb, goUpc, searchUpc)',
  })
  async getRawLookup(
    @Param('barcode') barcode: string,
    @Param('source') source: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productLookupService.globalRawLookup(barcode, source, userId);
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
  async lookup(@Param('barcode') barcode: string, @CurrentUser('sub') userId: string) {
    if (!barcode || barcode.length < 8) {
      throw new BadRequestException('Invalid barcode format');
    }

    const { data, cacheStatus } = await this.productLookupService.lookup(barcode, userId);

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

  @Post('compare')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Compare multiple products' })
  @ApiResponse({ status: 200, description: 'Comparison result' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async compare(
    @Body() compareDto: CompareProductsDto,
    @CurrentUser('sub') userId: string,
  ): Promise<{ products: ProductInfo[]; comparison: ProductComparison }> {
    return this.productLookupService.compare(compareDto.barcodes, userId);
  }
}
