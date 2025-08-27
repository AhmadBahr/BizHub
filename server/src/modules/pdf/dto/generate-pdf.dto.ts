import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PdfEntityType {
  CONTACT = 'contact',
  LEAD = 'lead',
  DEAL = 'deal',
  REPORT = 'report',
}

export enum PdfTemplate {
  DEFAULT = 'default',
  PROFESSIONAL = 'professional',
  MINIMAL = 'minimal',
}

export class GeneratePdfDto {
  @ApiProperty({ description: 'Entity type to generate PDF for', enum: PdfEntityType })
  @IsEnum(PdfEntityType)
  entityType: PdfEntityType;

  @ApiProperty({ description: 'Entity ID or report type' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'PDF template to use', enum: PdfTemplate, default: PdfTemplate.DEFAULT })
  @IsOptional()
  @IsEnum(PdfTemplate)
  template?: PdfTemplate = PdfTemplate.DEFAULT;
}
