import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { AnalyticsFilterDto } from './analytics-filter.dto';

export class GetScansDto extends IntersectionType(PaginationDto, AnalyticsFilterDto) {}
