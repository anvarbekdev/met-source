import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../roles/role.enum';

@ApiTags('Clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() body: any) {
    return this.clinicsService.create(body);
  }

  @Get()
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.clinicsService.findNearby(+lat, +lng, radius ? +radius : 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLINIC_ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.clinicsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }
}
