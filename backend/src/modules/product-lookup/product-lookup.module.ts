import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductLookupService } from './product-lookup.service';

@Module({
  imports: [ConfigModule],
  providers: [ProductLookupService],
  exports: [ProductLookupService],
})
export class ProductLookupModule {}
