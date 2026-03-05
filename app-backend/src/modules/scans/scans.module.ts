import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from '@database/entities/scan.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { ScansService } from '@modules/scans/scans.service';
import { ScansController } from '@modules/scans/scans.controller';
import { ScansGateway } from '@modules/scans/scans.gateway';

import { ProductLookupModule } from '@modules/product-lookup/product-lookup.module';

@Module({
  imports: [TypeOrmModule.forFeature([Scan]), AuthModule, ProductLookupModule],
  controllers: [ScansController],
  providers: [ScansService, ScansGateway],
  exports: [ScansService],
})
export class ScansModule {}
