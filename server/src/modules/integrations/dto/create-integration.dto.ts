import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  apiUrl?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  config?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
