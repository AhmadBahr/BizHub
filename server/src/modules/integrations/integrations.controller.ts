import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  create(@Body() createIntegrationDto: CreateIntegrationDto, @Request() req) {
    return this.integrationsService.create(createIntegrationDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.integrationsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.integrationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIntegrationDto: UpdateIntegrationDto, @Request() req) {
    return this.integrationsService.update(id, updateIntegrationDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.integrationsService.remove(id, req.user.id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: { isActive: boolean }, @Request() req) {
    return this.integrationsService.toggle(id, body.isActive, req.user.id);
  }

  @Post(':id/test')
  test(@Param('id') id: string, @Request() req) {
    return this.integrationsService.test(id, req.user.id);
  }
}
