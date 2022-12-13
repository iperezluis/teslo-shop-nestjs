import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { TagsDto } from 'src/common/dtos/tags.dto';
import { Auth, GetUser, ValidRoles } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
//Lo maravilloso de este Auth es que solo al colocarlo aqui protegemos todas las rutas de abajo, os ea que nadie que no este authenticado como monimo no pueda ejecutar ninguna
// @Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  //!en este caso como quiero que mi backend trabaje asi, quiero que solo los administradores puedan crear productos para vender por eso lo colocamos aqui
  @Post()
  @Auth()
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.removeProduct(id);
  }
}
