import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BulkOperationsService } from './bulk-operations.service';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('bulk-operations')
@Controller('bulk-operations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BulkOperationsController {
  constructor(private readonly bulkOperationsService: BulkOperationsService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview bulk operation' })
  @ApiResponse({ status: 200, description: 'Bulk operation preview retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async previewBulkOperation(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.bulkOperationsService.getBulkOperationPreview(bulkOperationDto, user.id);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete entities' })
  @ApiResponse({ status: 200, description: 'Entities deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkDelete(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.bulkOperationsService.bulkDelete(bulkOperationDto, user.id);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update entities' })
  @ApiResponse({ status: 200, description: 'Entities updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkUpdate(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.bulkOperationsService.bulkUpdate(bulkOperationDto, user.id);
  }

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk assign entities' })
  @ApiResponse({ status: 200, description: 'Entities assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkAssign(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.bulkOperationsService.bulkAssign(bulkOperationDto, user.id);
  }

  @Post('status-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk status update entities' })
  @ApiResponse({ status: 200, description: 'Entity statuses updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkStatusUpdate(
    @Body() bulkOperationDto: BulkOperationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.bulkOperationsService.bulkStatusUpdate(bulkOperationDto, user.id);
  }
}
