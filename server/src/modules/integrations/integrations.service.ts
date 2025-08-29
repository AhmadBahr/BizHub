import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIntegrationDto: CreateIntegrationDto, userId: string) {
    return this.prisma.integration.create({
      data: {
        ...createIntegrationDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.integration.findMany({
      where: { 
        isActive: true,
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.integration.findUnique({
      where: { 
        id,
        userId,
      },
    });
  }

  async update(id: string, updateIntegrationDto: UpdateIntegrationDto, userId: string) {
    return this.prisma.integration.update({
      where: { 
        id,
        userId,
      },
      data: updateIntegrationDto,
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.integration.delete({
      where: { 
        id,
        userId,
      },
    });
  }

  async toggle(id: string, isActive: boolean, userId: string) {
    return this.prisma.integration.update({
      where: { 
        id,
        userId,
      },
      data: { isActive },
    });
  }

  async test(id: string, userId: string) {
    // Mock integration test
    return { success: true, message: 'Integration test successful' };
  }
}
