import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { awsS3 } from './helpers/aws-sdk.helper';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { Repository } from 'typeorm';
import { ProductImage } from 'src/products/entities';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { InternalErrorException } from '@aws-sdk/client-sns';

@Injectable()
export class FileService {
  constructor(
    @Inject(forwardRef(() => ProductsService))
    private readonly productService: ProductsService, //
    private readonly configService: ConfigService, // private readonly productImageRepository: Repository<ProductImage>,
  ) {}
  getStaticProductImage(imageName: string) {
    //verificar que el archivo existea sin importar que tipo de dato es
    const path = join(__dirname, '../../static/uploads', imageName);

    if (!existsSync(path)) {
      throw new Error(`Not product found with image ${imageName}`);
    }

    return path;
  }

  async uploadProductImage(id: string, file: Express.Multer.File) {
    //en este punto verificamos que exista un producto con el id al que quieres subir la images a s3  de lo contrario retorna product not found
    const product = await this.productService.findOnePlain(id);

    const { path = '', mimetype, filename } = file;
    const fileStream = createReadStream(path);
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:
        mimetype === 'video/mp4'
          ? `products/${product.id}/videos/${filename}`
          : `products/${product.id}/images/${filename}`,
      ContentType: mimetype,
      Body: fileStream,

      // ACL: 'public-read',
    };
    // console.log(fileStream);
    const command = new PutObjectCommand(uploadParams);
    try {
      const result = await awsS3().send(command);
      const secureURL = `https://${
        process.env.AWS_BUCKET_NAME
      }.s3.amazonaws.com/${uploadParams.Key.replaceAll(' ', '+')}`;
      // console.log({ result });
      let productUpdated: UpdateProductDto;
      product.images.push(secureURL);
      productUpdated = { ...product };
      // const { ...detailsProduct } = product;
      await this.productService.update(id, productUpdated);
      return { secureURL, productUpdated };
      //code aws
      // const secureURL = `${this.configService.get(
      //   'HOST_NAME',
      // )}/file/product/${filename}`;
      // return secureURL;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async findAllImages() {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'user/product/images',
    });

    try {
      const images = await awsS3().send(command);
      console.log('imafes', images['$metadata']);
      if (!images.Contents) {
        throw new NotFoundException('images not found');
      }

      let Allimages: string[] = [];
      images.Contents.map((el) => {
        const secureURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${el.Key}`;
        Allimages.push(secureURL);
      });
      console.log(images);
      return Allimages;
    } catch (error) {
      console.log(error);
      this.handleExecutions(error);
    }
  }
  async findAllVideos() {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'videos',
    });

    try {
      const videos = await awsS3().send(command);
      let Allvideos: string[] = [];
      videos.Contents.map((el) => {
        const secureURL = `https://${
          process.env.AWS_BUCKET_NAME
        }.s3.amazonaws.com/${el.Key.replaceAll(' ', '+')}`;
        Allvideos.push(secureURL);
      });
      // console.log(videos);
      return Allvideos;
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update() {
    return `This action updates a  file`;
  }

  async removeProductImage(id: string, key: string) {
    //buscamaos si el producto existe
    const product = await this.productService.findOnePlain(id);

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/${product.id}/images/${key}`,
    };
    try {
      const data = await awsS3().send(new DeleteObjectCommand(uploadParams));
      console.log({ data });
      await this.productService.removeImageProduct(product, key);
      return { ok: 'successfully deleted', id, key };
    } catch (error) {
      console.log(error);
    }
  }
  //clean code, don't repeat yourselft
  // private getParams(id:string, file: Express.Multer.File) {
  //   const { filename, mimetype } = file;
  //   const uploadParams: PutObjectCommandInput = {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Key:
  //       mimetype === 'video/mp4'
  /*         ? `products/videos/${filename}`*/
  //         : `users/products/images/${filename}`,
  //     ContentType: mimetype,
  //     // ACL: 'public-read',
  //   };
  //   return uploadParams;
  // }

  private handleExecutions(error: any) {
    if (error.status === 404) {
      throw new NotFoundException('the files not found');
    }
    throw new InternalErrorException(error.detail);
  }
}
