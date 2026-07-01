import { Controller, Post, Get, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientAssistantService } from './patient-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Patient-Assistant')
@Controller('patient-assistant')
export class PatientAssistantController {
  constructor(private readonly service: PatientAssistantService) {}

  @Post('symptom-check')
  @ApiOperation({ summary: 'Simptomlarni baholash (ommaviy)' })
  checkSymptoms(
    @Body() body: { symptomText: string; sessionId?: string },
  ) {
    return this.service.checkSymptoms(body.symptomText, undefined, body.sessionId);
  }

  @Post('symptom-stream')
  @ApiOperation({ summary: 'Simptomlarni real-vaqtda oqim bilan baholash (SSE)' })
  async streamSymptoms(
    @Body() body: { symptomText: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    try {
      await this.service.streamSymptomCheck(
        body.symptomText,
        (text) => res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`),
        (data) => res.write(`data: ${JSON.stringify({ type: 'done', ...data })}\n\n`),
      );
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Xatolik yuz berdi' })}\n\n`);
    }
    res.end();
  }

  @Get('nearby-clinics')
  @ApiOperation({ summary: 'Yaqin atrofdagi klinikalar' })
  getNearbyClinics(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.service.getNearbyClinics(+lat, +lng, radius ? +radius : 10);
  }

  @Post('notify-doctor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Shifokorga avtomatik xabar yuborish va navbat yaratish' })
  notifyDoctor(
    @Body() body: {
      patientId: string;
      doctorId?: string;
      symptomSummary: string;
      urgencyLevel: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.service.notifyDoctor({ ...body, userId: user.id });
  }
}
