import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto, ContactQueryDto, ContactResponseDto } from './dto/contact.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    // Check if contact already exists
    const existingContact = await this.prisma.contact.findFirst({
      where: { email: createContactDto.email },
    });

    if (existingContact) {
      throw new ConflictException('Contact with this email already exists');
    }

    const contact = await this.prisma.contact.create({
      data: createContactDto,
    });

    return contact;
  }

  async findAll(query: ContactQueryDto): Promise<PaginationResponseDto> {
    const { page = 1, limit = 10, search, company, tags, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findById(id: string): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<ContactResponseDto> {
    // Check if contact exists
    const existingContact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundException('Contact not found');
    }

    // If updating email, check if it's already taken by another contact
    if (updateContactDto.email && updateContactDto.email !== existingContact.email) {
      const emailExists = await this.prisma.contact.findFirst({
        where: { email: updateContactDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Contact with this email already exists');
      }
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });

    return contact;
  }

  async remove(id: string): Promise<void> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.contact.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isActive: false },
    });

    return contact;
  }

  async activate(id: string): Promise<ContactResponseDto> {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isActive: true },
    });

    return contact;
  }

  async getContactStats() {
    const [total, active, byCompany] = await Promise.all([
      this.prisma.contact.count(),
      this.prisma.contact.count({ where: { isActive: true } }),
      this.prisma.contact.groupBy({
        by: ['company'],
        _count: { company: true },
        where: { company: { not: null } },
        orderBy: { _count: { company: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      topCompanies: byCompany.map(item => ({
        company: item.company,
        count: item._count.company,
      })),
    };
  }
}
