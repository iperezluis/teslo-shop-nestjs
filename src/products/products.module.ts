import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

import { Product, ProductImage } from './entities';
import { FileModule } from 'src/file/file.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    forwardRef(() => FileModule),
    AuthModule
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
