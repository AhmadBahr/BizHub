import { Controller, Get, Delete, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserResponseDto } from '../../users/dto/user.dto';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('my-sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user sessions' })
  @ApiResponse({ 
    status: 200, 
    description: 'User sessions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          data: { type: 'object' },
          expiresAt: { type: 'string', format: 'date-time' },
          lastActivity: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMySessions(@CurrentUser() user: UserResponseDto) {
    const sessions = await this.sessionService.getUserSessions(user.id);
    return {
      sessions,
      count: sessions.length,
    };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSessions: { type: 'number' },
        activeSessions: { type: 'number' },
        expiredSessions: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessionStats() {
    return this.sessionService.getSessionStats();
  }

  @Delete('my-sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Destroy a specific session' })
  @ApiResponse({ status: 200, description: 'Session destroyed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async destroySession(
    @CurrentUser() user: UserResponseDto,
    @Param('sessionId') sessionId: string,
  ) {
    // Verify the session belongs to the current user
    const sessions = await this.sessionService.getUserSessions(user.id);
    const sessionExists = sessions.some(session => session.sessionId === sessionId);
    
    if (!sessionExists) {
      throw new Error('Session not found or does not belong to user');
    }

    await this.sessionService.destroySession(sessionId);
    return { message: 'Session destroyed successfully' };
  }

  @Delete('my-sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Destroy all user sessions (logout from all devices)' })
  @ApiResponse({ status: 200, description: 'All sessions destroyed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async destroyAllSessions(@CurrentUser() user: UserResponseDto) {
    await this.sessionService.destroyAllUserSessions(user.id);
    return { message: 'All sessions destroyed successfully' };
  }

  @Get('current-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current session information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current session information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        data: { type: 'object' },
        expiresAt: { type: 'string', format: 'date-time' },
        lastActivity: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentSession(@Req() request: any) {
    // Extract session ID from request (you might need to adjust this based on your setup)
    const sessionId = request.headers['x-session-id'] || request.session?.id;
    
    if (!sessionId) {
      throw new Error('No session ID found in request');
    }

    const sessionData = await this.sessionService.getSession(sessionId);
    if (!sessionData) {
      throw new Error('Session not found or expired');
    }

    return {
      sessionId,
      data: sessionData,
    };
  }
}
