import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.filesService.uploadFile(file, user.id, createFileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async findAll(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.filesService.findAll(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get files by entity' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.filesService.findByEntity(entityType, entityId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  @ApiResponse({ status: 200, description: 'File details retrieved successfully' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.filesService.findOne(id, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Res() res: Response,
  ) {
    const fileData = await this.filesService.download(id, user.id);
    
    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${fileData.originalName}"`,
    });
    
    res.send(fileData.file);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get file statistics' })
  @ApiResponse({ status: 200, description: 'File statistics retrieved successfully' })
  async getFileStats(@CurrentUser() user: UserResponseDto) {
    return this.filesService.getFileStats(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.filesService.delete(id, user.id);
  }
}
