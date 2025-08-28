import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF' })
  @ApiResponse({ status: 201, description: 'PDF generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generatePdf(
    @Body() generatePdfDto: GeneratePdfDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.pdfService.generatePdf(generatePdfDto, user.id);
  }

  @Post('download/:fileName')
  @ApiOperation({ summary: 'Download generated PDF' })
  @ApiResponse({ status: 200, description: 'PDF downloaded successfully' })
  async downloadPdf(
    @Param('fileName') fileName: string,
    @CurrentUser() user: UserResponseDto,
    @Res() res: Response,
  ) {
    const filePath = path.join(process.cwd(), 'pdfs', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
