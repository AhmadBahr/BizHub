import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportDto } from './dto/export.dto';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportData(exportDto: ExportDto, userId: string) {
    const { entityType, format, filters } = exportDto;
    
    let data: any[] = [];
    
    switch (entityType) {
      case 'contacts':
        data = await this.exportContacts(userId, filters);
        break;
      case 'leads':
        data = await this.exportLeads(userId, filters);
        break;
      case 'deals':
        data = await this.exportDeals(userId, filters);
        break;
      case 'tasks':
        data = await this.exportTasks(userId, filters);
        break;
      case 'activities':
        data = await this.exportActivities(userId, filters);
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const fileName = `${entityType}_export_${Date.now()}.${format}`;
    const filePath = path.join(process.cwd(), 'exports', fileName);
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    if (format === 'xlsx') {
      await this.exportToExcel(data, filePath, entityType);
    } else if (format === 'csv') {
      await this.exportToCsv(data, filePath);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    return {
      fileName,
      filePath,
      recordCount: data.length,
      downloadUrl: `/api/export/download/${fileName}`,
    };
  }

  private async exportContacts(userId: string, filters: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.source) {
      where.source = filters.source;
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      include: {
        leads: true,
        deals: true,
      },
    });

    return contacts.map(contact => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      // Contacts don't have status or source fields
      notes: contact.notes,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      leadCount: contact.leads.length,
      dealCount: contact.deals.length,
    }));
  }

  private async exportLeads(userId: string, filters: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.source) {
      where.source = filters.source;
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        contact: true,
        activities: true,
      },
    });

    return leads.map(lead => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      status: lead.status,
      source: lead.source,
      value: lead.value,
      notes: lead.notes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      contactName: lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : null,
      activityCount: lead.activities.length,
    }));
  }

  private async exportDeals(userId: string, filters: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.stage) {
      where.stage = filters.stage;
    }

    const deals = await this.prisma.deal.findMany({
      where,
      include: {
        contact: true,
        activities: true,
      },
    });

    return deals.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      value: deal.value,
      stage: deal.stage,
      status: deal.status,
      expectedCloseDate: deal.expectedCloseDate,
      probability: deal.probability,
      notes: deal.notes,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
      contactName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : null,
      activityCount: deal.activities.length,
    }));
  }

  private async exportTasks(userId: string, filters: any) {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        assignedTo: true,
      },
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      notes: task.notes,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedTo: task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : null,
    }));
  }

  private async exportActivities(userId: string, filters: any) {
    const where: any = { userId };
    
    if (filters?.type) {
      where.type = filters.type;
    }

    const activities = await this.prisma.activity.findMany({
      where,
      include: {
        lead: true,
        deal: true,
      },
    });

    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      duration: activity.duration,
      scheduledAt: activity.scheduledAt,
      notes: activity.notes,
      tags: activity.tags,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      leadTitle: activity.lead?.title || null,
      dealTitle: activity.deal?.title || null,
    }));
  }

  private async exportToExcel(data: any[], filePath: string, sheetName: string) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
  }

  private async exportToCsv(data: any[], filePath: string) {
    if (data.length === 0) {
      fs.writeFileSync(filePath, '');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    fs.writeFileSync(filePath, csvContent);
  }

  async getExportHistory(userId: string) {
    // This would typically query a separate table for export history
    // For now, we'll return a placeholder
    return [];
  }
}
