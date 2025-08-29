import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsUUID, IsNumber } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;
}
