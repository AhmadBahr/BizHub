import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Param,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ExportDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @ApiOperation({ summary: 'Export data' })
  @ApiResponse({ status: 201, description: 'Export created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async exportData(
    @Body() exportDto: ExportDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.exportService.exportData(exportDto, user.id);
  }

  @Get('download/:fileName')
  @ApiOperation({ summary: 'Download exported file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(
    @Param('fileName') fileName: string,
    @CurrentUser() user: UserResponseDto,
    @Res() res: Response,
  ) {
    const filePath = path.join(process.cwd(), 'exports', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileExtension = path.extname(fileName);
    let contentType = 'application/octet-stream';
    
    if (fileExtension === '.csv') {
      contentType = 'text/csv';
    } else if (fileExtension === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get export history' })
  @ApiResponse({ status: 200, description: 'Export history retrieved successfully' })
  async getExportHistory(@CurrentUser() user: UserResponseDto) {
    return this.exportService.getExportHistory(user.id);
  }
}
