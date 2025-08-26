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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, DealQueryDto, DealResponseDto } from './dto/deal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('deals')
@Controller('deals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  @ApiResponse({ status: 201, description: 'Deal created successfully', type: DealResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDealDto: CreateDealDto): Promise<DealResponseDto> {
    return this.dealsService.create(createDealDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deals with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Deals retrieved successfully' })
  findAll(@Query() query: DealQueryDto) {
    return this.dealsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get deal statistics' })
  @ApiResponse({ status: 200, description: 'Deal statistics retrieved successfully' })
  getDealStats() {
    return this.dealsService.getDealStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deal by ID' })
  @ApiResponse({ status: 200, description: 'Deal retrieved successfully', type: DealResponseDto })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  findOne(@Param('id') id: string): Promise<DealResponseDto> {
    return this.dealsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  @ApiResponse({ status: 200, description: 'Deal updated successfully', type: DealResponseDto })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ): Promise<DealResponseDto> {
    return this.dealsService.update(id, updateDealDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  @ApiResponse({ status: 200, description: 'Deal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dealsService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a deal' })
  @ApiResponse({ status: 200, description: 'Deal deactivated successfully', type: DealResponseDto })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  deactivate(@Param('id') id: string): Promise<DealResponseDto> {
    return this.dealsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a deal' })
  @ApiResponse({ status: 200, description: 'Deal activated successfully', type: DealResponseDto })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  activate(@Param('id') id: string): Promise<DealResponseDto> {
    return this.dealsService.activate(id);
  }
}
