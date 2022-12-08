import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { FileService } from 'src/file/file.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    // injectRepostory viene del TypeORM que estamos usando
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        //no necesitas agregar el productId porque typeOrm lo infiere
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(product);
      return product;
      // return { ...product, images};
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    return product.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string): Promise<Product> {
    let product: Product;
    // const product = await this.productRepository.findOneBy({ i });
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }
    if (!isUUID(term)) {
      //Aqui consultamso con where para obtener producto por titulo o slug
      //UPPER: agregamos UPPER en postgress para que transforme el titulo que introdujo el usuario y pueda encontrarlo
      // el "prod" dentro del queryBuilder es un alias que agregamos para que el leftJoinandSelect pueda encontrar ese alias y nos traiga la relacion que queremos ya que cuando usamos queryBuilder los eager son desactivados
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with term: ${term} not found`);
    }
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    //  create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // si en el arreglo vienen strings o sea nuevas imagenes elimianmos las anteriores
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id: id } });
        //we create the new images
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      // we do the commit and close connection with release
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
      // await this.productRepository.save(product);
    } catch (error) {
      // if transaction fails then we reverts changes and disconnect
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExeptions(error);
    }
  }

  async removeProduct(id: string) {
    const { affected } = await this.productRepository.delete(id);
    if (affected === 0) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
    return `Product deleted succesfully`;
  }

  async removeImageProduct(id: string, key: string) {
    const secureURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/user/products/images/${key}`;
    console.log('secure', secureURL);
    try {
      const { affected } = await this.productImageRepository.delete({
        url: secureURL,
      });
      if (affected === 0) {
        throw new NotFoundException(`Product with id: ${id} not found`);
      }
      return `Product deleted succesfully`;
    } catch (error) {
      this.handleExeptions(error);
    }
  }
  private handleExeptions(error: any) {
    // console.log(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error - check server logs',
    );
  }
  async deleteAllProducts() {
    const query = await this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExeptions(error);
    }
  }
}
