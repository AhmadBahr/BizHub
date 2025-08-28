import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  LEAD = 'LEAD',
  DEAL = 'DEAL',
  TASK = 'TASK',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'User ID to send notification to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Related entity ID (optional)' })
  @IsOptional()
  @IsUUID()
  relatedId?: string;

  @ApiProperty({ description: 'Whether notification is read', default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
