import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { MedicalFile } from './entities/medical-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalFile]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  providers: [FilesService],
  exports: [FilesService, TypeOrmModule, MulterModule],
})
export class FilesModule {}
