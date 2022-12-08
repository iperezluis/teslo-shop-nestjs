import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { fileNamer, fileFilter } from './helpers';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
    imageName: string,
  ) {
    const path = this.fileService.getStaticProductImage(imageName);

    return res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      limits: {
        // Max field value size (Default: 1MB)
        // fieldSize: 100000
      },
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.upload(file);
  }

  @Get('images')
  getProductImages() {
    return this.fileService.findAll();
  }

  @Delete('product/:key')
  deletedImage(@Param('key') key: string) {
    return this.fileService.remove(key);
  }
}
