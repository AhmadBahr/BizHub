import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum DealStatus {
  OPPORTUNITY = 'OPPORTUNITY',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export class CreateDealDto {
  @ApiProperty({ description: 'Deal title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Deal description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Deal value', type: 'number' })
  @Type(() => Number)
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Deal status', enum: DealStatus, default: DealStatus.OPPORTUNITY })
  @IsEnum(DealStatus)
  status: DealStatus = DealStatus.OPPORTUNITY;

  @ApiProperty({ description: 'Expected close date' })
  @Type(() => Date)
  expectedCloseDate: Date;

  @ApiProperty({ description: 'Contact ID' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ description: 'Lead ID', required: false })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ description: 'Assigned user ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ description: 'Probability percentage', type: 'number', minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  probability: number;

  @ApiProperty({ description: 'Deal source', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'Deal notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDealDto {
  @ApiProperty({ description: 'Deal title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Deal description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Deal value', type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @ApiProperty({ description: 'Deal status', enum: DealStatus, required: false })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiProperty({ description: 'Expected close date', required: false })
  @IsOptional()
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiProperty({ description: 'Contact ID', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Lead ID', required: false })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ description: 'Assigned user ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ description: 'Probability percentage', type: 'number', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  probability?: number;

  @ApiProperty({ description: 'Deal source', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'Deal notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DealQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Deal status', enum: DealStatus, required: false })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiProperty({ description: 'Assigned user ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ description: 'Minimum deal value', type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minValue?: number;

  @ApiProperty({ description: 'Maximum deal value', type: 'number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxValue?: number;

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  value: number;

  @ApiProperty({ enum: DealStatus })
  status: DealStatus;

  @ApiProperty()
  expectedCloseDate: Date;

  @ApiProperty()
  probability: number;

  @ApiProperty({ required: false })
  source?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  contactId: string;

  @ApiProperty({ required: false })
  leadId?: string;

  @ApiProperty({ required: false })
  assignedToId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };

  @ApiProperty({ required: false })
  lead?: {
    id: string;
    title: string;
    description: string;
    status: string;
    source: string;
    score: number;
    value: number;
  };

  @ApiProperty({ required: false })
  assignedTo?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
