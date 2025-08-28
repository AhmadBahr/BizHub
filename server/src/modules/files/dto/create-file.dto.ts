import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EntityType {
  LEAD = 'LEAD',
  DEAL = 'DEAL',
  CONTACT = 'CONTACT',
  TASK = 'TASK',
  ACTIVITY = 'ACTIVITY',
}

export class CreateFileDto {
  @ApiProperty({ description: 'Entity type', enum: EntityType })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'File description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
