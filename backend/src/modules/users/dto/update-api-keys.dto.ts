import { IsOptional, IsString } from 'class-validator';

export class UpdateApiKeysDto {
  @IsOptional()
  @IsString()
  upcDatabaseApiKey?: string;

  @IsOptional()
  @IsString()
  barcodeLookupApiKey?: string;
}
