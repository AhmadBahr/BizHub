import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePdf(generatePdfDto: GeneratePdfDto, userId: string) {
    const { entityType, entityId, template } = generatePdfDto;
    
    let data: any;
    let htmlContent: string;

    // Fetch data based on entity type
    switch (entityType) {
      case 'contact':
        data = await this.getContactData(entityId, userId);
        htmlContent = this.generateContactPdfHtml(data, template);
        break;
      case 'lead':
        data = await this.getLeadData(entityId, userId);
        htmlContent = this.generateLeadPdfHtml(data, template);
        break;
      case 'deal':
        data = await this.getDealData(entityId, userId);
        htmlContent = this.generateDealPdfHtml(data, template);
        break;
      case 'report':
        data = await this.getReportData(entityId, userId);
        htmlContent = this.generateReportPdfHtml(data, template);
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Generate PDF
    const fileName = `${entityType}_${entityId}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'pdfs', fileName);
    
    // Create pdfs directory if it doesn't exist
    const pdfsDir = path.join(process.cwd(), 'pdfs');
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    const pdfBuffer = await this.generatePdfFromHtml(htmlContent);
    fs.writeFileSync(filePath, pdfBuffer);

    return {
      fileName,
      filePath,
      downloadUrl: `/api/pdf/download/${fileName}`,
      size: pdfBuffer.length,
    };
  }

  private async getContactData(contactId: string, userId: string) {
    return this.prisma.contact.findFirst({
      where: { id: contactId, userId },
      include: {
        leads: true,
        deals: true,
      },
    });
  }

  private async getLeadData(leadId: string, userId: string) {
    return this.prisma.lead.findFirst({
      where: { id: leadId, userId },
      include: {
        contact: true,
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  private async getDealData(dealId: string, userId: string) {
    return this.prisma.deal.findFirst({
      where: { id: dealId, userId },
      include: {
        contact: true,
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  private async getReportData(reportType: string, userId: string) {
    // This would generate different types of reports
    switch (reportType) {
      case 'sales-summary':
        return this.generateSalesSummaryReport(userId);
      case 'lead-analysis':
        return this.generateLeadAnalysisReport(userId);
      case 'deal-pipeline':
        return this.generateDealPipelineReport(userId);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  private async generateSalesSummaryReport(userId: string) {
    const [totalDeals, totalValue, dealsByStage] = await Promise.all([
      this.prisma.deal.count({ where: { userId } }),
      this.prisma.deal.aggregate({
        where: { userId },
        _sum: { value: true },
      }),
      this.prisma.deal.groupBy({
        by: ['stage'],
        where: { userId },
        _count: { id: true },
        _sum: { value: true },
      }),
    ]);

    return {
      reportType: 'Sales Summary',
      totalDeals,
      totalValue: totalValue._sum.value || 0,
      dealsByStage,
      generatedAt: new Date(),
    };
  }

  private async generateLeadAnalysisReport(userId: string) {
    const [totalLeads, leadsBySource, leadsByStatus] = await Promise.all([
      this.prisma.lead.count({ where: { userId } }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    return {
      reportType: 'Lead Analysis',
      totalLeads,
      leadsBySource,
      leadsByStatus,
      generatedAt: new Date(),
    };
  }

  private async generateDealPipelineReport(userId: string) {
    const dealsByStage = await this.prisma.deal.groupBy({
      by: ['stage'],
      where: { userId },
      _count: { id: true },
      _sum: { value: true },
    });

    return {
      reportType: 'Deal Pipeline',
      dealsByStage,
      generatedAt: new Date(),
    };
  }

  private generateContactPdfHtml(contact: any, template: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Report - ${contact.firstName} ${contact.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Contact Report</h1>
            <h2>${contact.firstName} ${contact.lastName}</h2>
          </div>
          
          <div class="section">
            <h2>Contact Information</h2>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${contact.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${contact.phone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Company:</span>
              <span class="value">${contact.company || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Position:</span>
              <span class="value">${contact.position || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${contact.status}</span>
            </div>
          </div>

          <div class="section">
            <h2>Related Leads (${contact.leads.length})</h2>
            ${contact.leads.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${contact.leads.map(lead => `
                    <tr>
                      <td>${lead.firstName} ${lead.lastName}</td>
                      <td>${lead.company || 'N/A'}</td>
                      <td>${lead.status}</td>
                      <td>$${lead.value || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No related leads</p>'}
          </div>

          <div class="section">
            <h2>Related Deals (${contact.deals.length})</h2>
            ${contact.deals.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${contact.deals.map(deal => `
                    <tr>
                      <td>${deal.title}</td>
                      <td>${deal.stage}</td>
                      <td>$${deal.value || 0}</td>
                      <td>${deal.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No related deals</p>'}
          </div>

          <div class="section">
            <h2>Recent Activities (${contact.activities.length})</h2>
            ${contact.activities.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${contact.activities.map(activity => `
                    <tr>
                      <td>${activity.title}</td>
                      <td>${activity.type}</td>
                      <td>${new Date(activity.scheduledAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No recent activities</p>'}
          </div>
        </body>
      </html>
    `;
  }

  private generateLeadPdfHtml(lead: any, template: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lead Report - ${lead.firstName} ${lead.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lead Report</h1>
            <h2>${lead.firstName} ${lead.lastName}</h2>
          </div>
          
          <div class="section">
            <h2>Lead Information</h2>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${lead.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${lead.phone || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Company:</span>
              <span class="value">${lead.company || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Position:</span>
              <span class="value">${lead.position || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${lead.status}</span>
            </div>
            <div class="info-row">
              <span class="label">Source:</span>
              <span class="value">${lead.source}</span>
            </div>
            <div class="info-row">
              <span class="label">Value:</span>
              <span class="value">$${lead.value || 0}</span>
            </div>
          </div>

          <div class="section">
            <h2>Recent Activities (${lead.activities.length})</h2>
            ${lead.activities.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${lead.activities.map(activity => `
                    <tr>
                      <td>${activity.title}</td>
                      <td>${activity.type}</td>
                      <td>${new Date(activity.scheduledAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No recent activities</p>'}
          </div>
        </body>
      </html>
    `;
  }

  private generateDealPdfHtml(deal: any, template: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Deal Report - ${deal.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Deal Report</h1>
            <h2>${deal.title}</h2>
          </div>
          
          <div class="section">
            <h2>Deal Information</h2>
            <div class="info-row">
              <span class="label">Description:</span>
              <span class="value">${deal.description || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Value:</span>
              <span class="value">$${deal.value || 0}</span>
            </div>
            <div class="info-row">
              <span class="label">Stage:</span>
              <span class="value">${deal.stage}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">${deal.status}</span>
            </div>
            <div class="info-row">
              <span class="label">Probability:</span>
              <span class="value">${deal.probability}%</span>
            </div>
            <div class="info-row">
              <span class="label">Expected Close Date:</span>
              <span class="value">${deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <h2>Recent Activities (${deal.activities.length})</h2>
            ${deal.activities.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${deal.activities.map(activity => `
                    <tr>
                      <td>${activity.title}</td>
                      <td>${activity.type}</td>
                      <td>${new Date(activity.scheduledAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p>No recent activities</p>'}
          </div>
        </body>
      </html>
    `;
  }

  private generateReportPdfHtml(report: any, template: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${report.reportType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .value { margin-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.reportType}</h1>
            <p>Generated on: ${report.generatedAt.toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Summary</h2>
            ${Object.keys(report).filter(key => !['reportType', 'generatedAt', 'dealsByStage', 'leadsBySource', 'leadsByStatus'].includes(key)).map(key => `
              <div class="info-row">
                <span class="label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                <span class="value">${typeof report[key] === 'number' && key.includes('Value') ? '$' + report[key] : report[key]}</span>
              </div>
            `).join('')}
          </div>

          ${report.dealsByStage ? `
            <div class="section">
              <h2>Deals by Stage</h2>
              <table>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Count</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.dealsByStage.map(stage => `
                    <tr>
                      <td>${stage.stage}</td>
                      <td>${stage._count.id}</td>
                      <td>$${stage._sum.value || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${report.leadsBySource ? `
            <div class="section">
              <h2>Leads by Source</h2>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.leadsBySource.map(source => `
                    <tr>
                      <td>${source.source}</td>
                      <td>${source._count.id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${report.leadsByStatus ? `
            <div class="section">
              <h2>Leads by Status</h2>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.leadsByStatus.map(status => `
                    <tr>
                      <td>${status.status}</td>
                      <td>${status._count.id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  private async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
