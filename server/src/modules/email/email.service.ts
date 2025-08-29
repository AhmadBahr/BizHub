import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@bizhub.com'),
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  // Predefined email templates
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const template = this.getWelcomeTemplate(userName);
    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendLeadNotificationEmail(to: string, leadData: any): Promise<void> {
    const template = this.getLeadNotificationTemplate(leadData);
    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendDealUpdateEmail(to: string, dealData: any): Promise<void> {
    const template = this.getDealUpdateTemplate(dealData);
    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendTaskReminderEmail(to: string, taskData: any): Promise<void> {
    const template = this.getTaskReminderTemplate(taskData);
    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to BizHub CRM!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to BizHub CRM!</h1>
          <p>Hello ${userName},</p>
          <p>Welcome to BizHub CRM! We're excited to have you on board.</p>
          <p>With BizHub, you can:</p>
          <ul>
            <li>Manage your contacts and leads</li>
            <li>Track deals and opportunities</li>
            <li>Organize tasks and activities</li>
            <li>Generate reports and analytics</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The BizHub Team</p>
        </div>
      `,
      text: `Welcome to BizHub CRM! Hello ${userName}, Welcome to BizHub CRM! We're excited to have you on board.`,
    };
  }

  private getLeadNotificationTemplate(leadData: any): EmailTemplate {
    return {
      subject: `New Lead: ${leadData.firstName} ${leadData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Lead Notification</h2>
          <p>A new lead has been added to your CRM:</p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Name:</strong> ${leadData.firstName} ${leadData.lastName}</p>
            <p><strong>Email:</strong> ${leadData.email}</p>
            <p><strong>Company:</strong> ${leadData.company || 'N/A'}</p>
            <p><strong>Source:</strong> ${leadData.source}</p>
            <p><strong>Value:</strong> $${leadData.value}</p>
          </div>
          <p>Please follow up with this lead as soon as possible.</p>
        </div>
      `,
    };
  }

  private getDealUpdateTemplate(dealData: any): EmailTemplate {
    return {
      subject: `Deal Update: ${dealData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Deal Update</h2>
          <p>The following deal has been updated:</p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Deal:</strong> ${dealData.title}</p>
            <p><strong>Value:</strong> $${dealData.value}</p>
            <p><strong>Stage:</strong> ${dealData.stage}</p>
            <p><strong>Probability:</strong> ${dealData.probability}%</p>
            <p><strong>Expected Close Date:</strong> ${dealData.expectedCloseDate}</p>
          </div>
        </div>
      `,
    };
  }

  private getTaskReminderTemplate(taskData: any): EmailTemplate {
    return {
      subject: `Task Reminder: ${taskData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Task Reminder</h2>
          <p>You have a task that needs your attention:</p>
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Task:</strong> ${taskData.title}</p>
            <p><strong>Description:</strong> ${taskData.description || 'No description'}</p>
            <p><strong>Due Date:</strong> ${taskData.dueDate}</p>
            <p><strong>Priority:</strong> ${taskData.priority}</p>
          </div>
          <p>Please complete this task as soon as possible.</p>
        </div>
      `,
    };
  }
}
