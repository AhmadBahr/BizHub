import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTicketReplyDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}


