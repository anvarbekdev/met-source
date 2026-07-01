import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DimedAssistantService } from './dimed-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../roles/role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Dimed-Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dimed-assistant')
export class DimedAssistantController {
  constructor(private readonly service: DimedAssistantService) {}

  @Post('query')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.DATA_ANALYST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'AI yordamchiga savol yuborish' })
  query(
    @Body() body: { question: string; sessionId?: string },
    @CurrentUser() user: User,
  ) {    
    console.log(this.service.query(body.question, user.id, body.sessionId), "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    
    return this.service.query(body.question, user.id, body.sessionId);
  }

  @Get('dashboard-stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.DATA_ANALYST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Dashboard statistikasi' })
  getDashboardStats() {
    return this.service.getDashboardStats();
  }

  @Get('history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.DATA_ANALYST)
  getHistory(@CurrentUser() user: User) {
    return this.service.getConversationHistory(user.id);
  }
}
