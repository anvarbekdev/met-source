import {
  Controller, Post, Get, Patch, Param, Body, Res, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DocDigitizerService } from './doc-digitizer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../roles/role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Doc-Digitizer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doc-digitizer')
export class DocDigitizerController {
  constructor(private readonly service: DocDigitizerService) {}

  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST, UserRole.DEPARTMENT_STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Hujjat yuklash va raqamlashtirish' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('patientId') patientId?: string,
  ) {
    return this.service.uploadAndDigitize(file, user.id, patientId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN, UserRole.RECEPTIONIST)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST, UserRole.CLINIC_ADMIN)
  @ApiOperation({ summary: 'AI natijasini qo\'lda tuzatish' })
  update(@Param('id') id: string, @Body() body: { extractedDataJson: object }) {
    return this.service.update(id, body.extractedDataJson);
  }

  @Get('export/:id')
  @ApiOperation({ summary: 'Excel formatida eksport' })
  async export(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.service.exportToExcel(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=document-${id}.xlsx`,
    });
    res.send(buffer);
  }
}
