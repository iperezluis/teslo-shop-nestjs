import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { Auth, ValidRoles } from 'src/auth/decorators';
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

  @Post('product/:id')
  @Auth(ValidRoles.admin)
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
  uploadProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadProductImage(id, file);
  }

  @Get('images')
  getProductImages() {
    return this.fileService.findAllImages();
  }
  @Get('videos')
  getAllVideos() {
    return this.fileService.findAllVideos();
  }

  @Delete('product/:id/:key')
  @Auth(ValidRoles.admin)
  deletedProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('key') key: string,
  ) {
    return this.fileService.removeProductImage(id, key);
  }
}
