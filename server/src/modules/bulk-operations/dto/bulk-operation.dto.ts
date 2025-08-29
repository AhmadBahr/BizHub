import { IsString, IsOptional, IsArray, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BulkEntityType {
  CONTACTS = 'contacts',
  LEADS = 'leads',
  DEALS = 'deals',
  TASKS = 'tasks',
  ACTIVITIES = 'activities',
}

export enum BulkOperationType {
  DELETE = 'delete',
  UPDATE = 'update',
  ASSIGN = 'assign',
  STATUS_UPDATE = 'status_update',
}

export class BulkOperationDto {
  @ApiProperty({ description: 'Entity type', enum: BulkEntityType })
  @IsEnum(BulkEntityType)
  entityType: BulkEntityType;

  @ApiProperty({ description: 'Operation type', enum: BulkOperationType })
  @IsEnum(BulkOperationType)
  operationType: BulkOperationType;

  @ApiProperty({ description: 'Array of entity IDs' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ description: 'Update data for bulk update operations', required: false })
  @IsOptional()
  @IsObject()
  updateData?: Record<string, any>;

  @ApiProperty({ description: 'Assignee ID for bulk assign operations', required: false })
  @IsOptional()
  @IsString()
  assignToId?: string;

  @ApiProperty({ description: 'Status for bulk status update operations', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
