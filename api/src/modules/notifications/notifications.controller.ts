import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchi bildirishnomalari' })
  getMyNotifications(
    @CurrentUser() user: User,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.service.getUserNotifications(user.id, unreadOnly === 'true');
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.markAsRead(id, user.id);
  }

  @Post('push-subscription')
  @ApiOperation({ summary: 'Push subscription saqlash' })
  savePushSubscription(@CurrentUser() user: User, @Body() subscription: object) {
    return this.service.savePushSubscription(user.id, subscription);
  }
}
