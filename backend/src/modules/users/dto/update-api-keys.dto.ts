import { IsOptional, IsString } from 'class-validator';

export class UpdateApiKeysDto {
  @IsOptional()
  @IsString()
  upcDatabaseApiKey?: string;

  @IsOptional()
  @IsString()
  barcodeLookupApiKey?: string;

  @IsOptional()
  @IsString()
  usdaFoodDataApiKey?: string;

  @IsOptional()
  @IsString()
  goUpcApiKey?: string;

  @IsOptional()
  @IsString()
  searchUpcApiKey?: string;
}
