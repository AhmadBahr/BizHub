import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleConfigDto {
  @IsOptional()
  @IsEnum([0, 1, 2, 3, 4, 5, 6])
  dayOfWeek?: number;

  @IsOptional()
  @IsEnum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
  dayOfMonth?: number;

  @IsOptional()
  @IsEnum([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  hour?: number;

  @IsOptional()
  @IsEnum([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  minute?: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  customCron?: string;
}

export class CreateScheduledExportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['contacts', 'leads', 'deals', 'tasks', 'analytics'])
  entityType: 'contacts' | 'leads' | 'deals' | 'tasks' | 'analytics';

  @IsEnum(['csv', 'excel', 'pdf'])
  format: 'csv' | 'excel' | 'pdf';

  @IsEnum(['daily', 'weekly', 'monthly', 'custom'])
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleConfigDto)
  scheduleConfig?: ScheduleConfigDto;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
