import {
  Controller, Post, Get, Patch, Param, Body, UseGuards, UseInterceptors,
  UploadedFile, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { OnkoAiService } from './onko-ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../roles/role.enum';
import { User } from '../users/entities/user.entity';
import { DiagnosisStatus } from './entities/diagnosis-result.entity';

@ApiTags('Onko-AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('onko-ai')
export class OnkoAiController {
  constructor(private readonly service: OnkoAiService) {}

  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.DEPARTMENT_STAFF, UserRole.DOCTOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tibbiy tasvir yuklash va AI tahlili boshlash' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('patientId') patientId?: string,
    @Body('context') context?: string,
  ) {
    return this.service.uploadAndAnalyze(file, user.id, patientId, context);
  }

  @Get('results')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.DOCTOR, UserRole.DEPARTMENT_STAFF)
  @ApiOperation({ summary: 'Barcha diagnostika natijalari' })
  findAll(@Query('clinicId') clinicId?: string) {
    return this.service.findAll(clinicId);
  }

  @Get('results/:patientId/patient')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.DEPARTMENT_STAFF, UserRole.PATIENT)
  @ApiOperation({ summary: 'Bemor bo\'yicha diagnostika natijalari' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get('results/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('results/:id/review')
  @Roles(UserRole.DOCTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Shifokor tomonidan tasdiqlash/rad etish' })
  review(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: { status: DiagnosisStatus; doctorNotes?: string },
  ) {
    return this.service.review(id, user.id, body);
  }
}
