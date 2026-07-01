import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../roles/role.enum';
import { AppointmentStatus } from './entities/appointment.entity';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST, UserRole.CLINIC_ADMIN, UserRole.PATIENT)
  @ApiOperation({ summary: 'Yangi navbat yaratish' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PATIENT)
  findAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('clinicId') clinicId?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.service.findAll({ patientId, doctorId, clinicId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.CLINIC_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: AppointmentStatus; notes?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.notes);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
