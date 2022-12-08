import { forwardRef, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ConfigService } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from 'src/products/entities';

@Module({
  controllers: [FileController],
  providers: [FileService, ConfigService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    forwardRef(() => ProductsModule),
  ],
  exports: [FileService],
})
export class FileModule {}
