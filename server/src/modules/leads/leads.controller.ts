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
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadResponseDto } from './dto/lead.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ 
    status: 201, 
    description: 'Lead created successfully', 
    type: LeadResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Contact or user not found' })
  async create(@Body() createLeadDto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all leads with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leads retrieved successfully', 
    type: PaginationResponseDto 
  })
  async findAll(@Query() query: LeadQueryDto): Promise<PaginationResponseDto> {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead statistics retrieved successfully' 
  })
  async getStats() {
    return this.leadsService.getLeadStats();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead retrieved successfully', 
    type: LeadResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(@Param('id') id: string): Promise<LeadResponseDto> {
    return this.leadsService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead updated successfully', 
    type: LeadResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateLeadDto: UpdateLeadDto
  ): Promise<LeadResponseDto> {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadsService.remove(id);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead deactivated successfully', 
    type: LeadResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async deactivate(@Param('id') id: string): Promise<LeadResponseDto> {
    return this.leadsService.deactivate(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead activated successfully', 
    type: LeadResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async activate(@Param('id') id: string): Promise<LeadResponseDto> {
    return this.leadsService.activate(id);
  }
}
