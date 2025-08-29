import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkOperationDto } from './dto/bulk-operation.dto';

@Injectable()
export class BulkOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkDelete(bulkOperationDto: BulkOperationDto, userId: string) {
    const { entityType, ids } = bulkOperationDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk delete');
    }

    let result: any;

    switch (entityType) {
      case 'contacts':
        result = await this.prisma.contact.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { isActive: false },
        });
        break;
      case 'leads':
        result = await this.prisma.lead.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { isActive: false },
        });
        break;
      case 'deals':
        result = await this.prisma.deal.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { isActive: false },
        });
        break;
      case 'tasks':
        result = await this.prisma.task.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { isActive: false },
        });
        break;
      case 'activities':
        result = await this.prisma.activity.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { isActive: false },
        });
        break;
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }

    return {
      message: `Successfully deleted ${result.count} ${entityType}`,
      deletedCount: result.count,
    };
  }

  async bulkUpdate(bulkOperationDto: BulkOperationDto, userId: string) {
    const { entityType, ids, updateData } = bulkOperationDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk update');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    let result: any;

    switch (entityType) {
      case 'contacts':
        result = await this.prisma.contact.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: updateData,
        });
        break;
      case 'leads':
        result = await this.prisma.lead.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: updateData,
        });
        break;
      case 'deals':
        result = await this.prisma.deal.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: updateData,
        });
        break;
      case 'tasks':
        result = await this.prisma.task.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: updateData,
        });
        break;
      case 'activities':
        result = await this.prisma.activity.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: updateData,
        });
        break;
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }

    return {
      message: `Successfully updated ${result.count} ${entityType}`,
      updatedCount: result.count,
    };
  }

  async bulkAssign(bulkOperationDto: BulkOperationDto, userId: string) {
    const { entityType, ids, assignToId } = bulkOperationDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk assign');
    }

    if (!assignToId) {
      throw new BadRequestException('No assignee ID provided');
    }

    // Verify assignee exists
    const assignee = await this.prisma.user.findUnique({
      where: { id: assignToId },
    });

    if (!assignee) {
      throw new BadRequestException('Assignee not found');
    }

    let result: any;

    switch (entityType) {
      case 'tasks':
        result = await this.prisma.task.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { assignedToId: assignToId },
        });
        break;
      case 'leads':
        result = await this.prisma.lead.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { assignedToId: assignToId },
        });
        break;
      case 'deals':
        result = await this.prisma.deal.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { assignedToId: assignToId },
        });
        break;
      default:
        throw new BadRequestException(`Bulk assign not supported for entity type: ${entityType}`);
    }

    return {
      message: `Successfully assigned ${result.count} ${entityType} to ${assignee.firstName} ${assignee.lastName}`,
      assignedCount: result.count,
      assignee: {
        id: assignee.id,
        name: `${assignee.firstName} ${assignee.lastName}`,
      },
    };
  }

  async bulkStatusUpdate(bulkOperationDto: BulkOperationDto, userId: string) {
    const { entityType, ids, status } = bulkOperationDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk status update');
    }

    if (!status) {
      throw new BadRequestException('No status provided');
    }

    let result: any;

    switch (entityType) {
      case 'contacts':
        // Contacts don't have a status field, skip this operation
        throw new BadRequestException('Bulk status update not supported for contacts');
        break;
      case 'leads':
        result = await this.prisma.lead.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { status: status as any },
        });
        break;
      case 'deals':
        result = await this.prisma.deal.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { status: status as any },
        });
        break;
      case 'tasks':
        result = await this.prisma.task.updateMany({
          where: {
            id: { in: ids },
            userId,
          },
          data: { status: status as any },
        });
        break;
      default:
        throw new BadRequestException(`Bulk status update not supported for entity type: ${entityType}`);
    }

    return {
      message: `Successfully updated status for ${result.count} ${entityType} to ${status}`,
      updatedCount: result.count,
      newStatus: status,
    };
  }

  async getBulkOperationPreview(bulkOperationDto: BulkOperationDto, userId: string) {
    const { entityType, ids } = bulkOperationDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided');
    }

    let items: any[];

    switch (entityType) {
      case 'contacts':
        items = await this.prisma.contact.findMany({
          where: {
            id: { in: ids },
            userId,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        });
        break;
      case 'leads':
        items = await this.prisma.lead.findMany({
          where: {
            id: { in: ids },
            userId,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            status: true,
            value: true,
          },
        });
        break;
      case 'deals':
        items = await this.prisma.deal.findMany({
          where: {
            id: { in: ids },
            userId,
          },
          select: {
            id: true,
            title: true,
            value: true,
            stage: true,
            status: true,
          },
        });
        break;
      case 'tasks':
        items = await this.prisma.task.findMany({
          where: {
            id: { in: ids },
            userId,
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        });
        break;
      case 'activities':
        items = await this.prisma.activity.findMany({
          where: {
            id: { in: ids },
            userId,
          },
          select: {
            id: true,
            title: true,
            type: true,
            scheduledAt: true,
          },
        });
        break;
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }

    return {
      entityType,
      totalItems: items.length,
      items,
    };
  }
}
