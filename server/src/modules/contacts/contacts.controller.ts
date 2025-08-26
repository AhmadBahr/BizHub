import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ContactQueryDto, ContactResponseDto } from './dto/contact.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({ 
    status: 201, 
    description: 'Contact created successfully', 
    type: ContactResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Contact already exists' })
  async create(@Body() createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all contacts with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contacts retrieved successfully', 
    type: PaginationResponseDto 
  })
  async findAll(@Query() query: ContactQueryDto): Promise<PaginationResponseDto> {
    return this.contactsService.findAll(query);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get contact statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact statistics retrieved successfully' 
  })
  async getStats() {
    return this.contactsService.getContactStats();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact retrieved successfully', 
    type: ContactResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(@Param('id') id: string): Promise<ContactResponseDto> {
    return this.contactsService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact updated successfully', 
    type: ContactResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateContactDto: UpdateContactDto
  ): Promise<ContactResponseDto> {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.contactsService.remove(id);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact deactivated successfully', 
    type: ContactResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async deactivate(@Param('id') id: string): Promise<ContactResponseDto> {
    return this.contactsService.deactivate(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact activated successfully', 
    type: ContactResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async activate(@Param('id') id: string): Promise<ContactResponseDto> {
    return this.contactsService.activate(id);
  }
}
