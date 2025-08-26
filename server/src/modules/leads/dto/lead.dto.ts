import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsUUID, IsArray, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  PHONE_CALL = 'PHONE_CALL',
  TRADE_SHOW = 'TRADE_SHOW',
  OTHER = 'OTHER',
}

export class CreateLeadDto {
  @ApiProperty({ example: 'Enterprise CRM Implementation' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Large enterprise looking for comprehensive CRM solution', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'NEW', enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus = LeadStatus.NEW;

  @ApiProperty({ example: 'WEBSITE', enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource = LeadSource.WEBSITE;

  @ApiProperty({ example: 75, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number = 0;

  @ApiProperty({ example: 50000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number = 0;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiProperty({ example: 'High priority lead, decision maker identified', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: ['enterprise', 'high-value'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'clm1234567890abcdef' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ example: 'clm1234567890abcdef', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ example: 'Enterprise CRM Implementation', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ example: 'Large enterprise looking for comprehensive CRM solution', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'QUALIFIED', enum: LeadStatus, required: false })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ example: 'REFERRAL', enum: LeadSource, required: false })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ example: 50000, minimum: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiProperty({ example: 'High priority lead, decision maker identified', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: ['enterprise', 'high-value'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'clm1234567890abcdef', required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ example: 'clm1234567890abcdef', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LeadQueryDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ required: false, enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minScore?: number;

  @ApiProperty({ required: false, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  maxScore?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: LeadStatus })
  status: LeadStatus;

  @ApiProperty({ enum: LeadSource })
  source: LeadSource;

  @ApiProperty()
  score: number;

  @ApiProperty()
  value: number;

  @ApiProperty({ required: false })
  expectedCloseDate?: Date;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  tags: string[];

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
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
