import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum ExportEntityType {
  CONTACTS = 'contacts',
  LEADS = 'leads',
  DEALS = 'deals',
  TASKS = 'tasks',
  ACTIVITIES = 'activities',
}

export class ExportDto {
  @ApiProperty({ description: 'Entity type to export', enum: ExportEntityType })
  @IsEnum(ExportEntityType)
  entityType: ExportEntityType;

  @ApiProperty({ description: 'Export format', enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({ description: 'Export filters', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
