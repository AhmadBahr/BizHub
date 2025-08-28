import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, userId: string, createFileDto: CreateFileDto) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // Save file metadata to database
    const fileRecord = await this.prisma.file.create({
      data: {
        originalName: file.originalname,
        fileName: fileName,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: userId,
        entityType: createFileDto.entityType,
        entityId: createFileDto.entityId,
        description: createFileDto.description,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return fileRecord;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.file.count({ where: { userId } }),
    ]);

    return {
      data: files,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEntity(entityType: string, entityId: string, userId: string) {
    return this.prisma.file.findMany({
      where: {
        entityType,
        entityId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async download(id: string, userId: string) {
    const file = await this.findOne(id, userId);
    
    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    const fileBuffer = fs.readFileSync(file.filePath);
    
    return {
      file: fileBuffer,
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  async delete(id: string, userId: string) {
    const file = await this.findOne(id, userId);
    
    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete record from database
    return this.prisma.file.delete({
      where: { id },
    });
  }

  async getFileStats(userId: string) {
    const stats = await this.prisma.file.groupBy({
      by: ['mimeType'],
      where: { userId },
      _count: {
        id: true,
      },
      _sum: {
        fileSize: true,
      },
    });

    const totalFiles = await this.prisma.file.count({ where: { userId } });
    const totalSize = await this.prisma.file.aggregate({
      where: { userId },
      _sum: {
        fileSize: true,
      },
    });

    return {
      totalFiles,
      totalSize: totalSize._sum.fileSize || 0,
      byType: stats.map(stat => ({
        mimeType: stat.mimeType,
        count: stat._count.id,
        size: stat._sum.fileSize || 0,
      })),
    };
  }
}
