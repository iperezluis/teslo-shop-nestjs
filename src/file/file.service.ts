import { forwardRef, Inject, Injectable, Param } from '@nestjs/common';
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
    const { path = '', mimetype } = file;
    const fileStream = createReadStream(path);
    // console.log(fileStream);
    const { ...params } = this.getParams(file);
    const command = new PutObjectCommand({ ...params, Body: fileStream });
    try {
      const result = await awsS3().send(command);
      const secureURL = `https://${
        process.env.AWS_BUCKET_NAME
      }.s3.amazonaws.com/${params.Key.replaceAll(' ', '+')}`;
      console.log({ result });
      const product = await this.productService.findOnePlain(id);
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
      Prefix: 'images',
    });

    try {
      const images = await awsS3().send(command);
      let dataImages: string[] = [];
      const data = images.Contents.map((el) => {
        const secureURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${el.Key}`;
        dataImages.push(secureURL);
      });
      console.log(images);
      return dataImages;
    } catch (error) {
      console.log(error);
    }
  }
  async findAllVideos() {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'videos',
    });

    try {
      const images = await awsS3().send(command);
      let videos: string[] = [];
      const data = images.Contents.map((el) => {
        const secureURL = `https://${
          process.env.AWS_BUCKET_NAME
        }.s3.amazonaws.com/${el.Key.replaceAll(' ', '+')}`;
        videos.push(secureURL);
      });
      console.log(images);
      return videos;
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
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `user/products/images/${key}`,
    };
    try {
      const data = await awsS3().send(new DeleteObjectCommand(uploadParams));
      console.log({ data });
      this.productService.removeImageProduct(id, key);
      return { ok: 'successfully deleted', id, key };
    } catch (error) {
      console.log(error);
    }
  }
  //clean code, don't repeat yourselft
  private getParams(file: Express.Multer.File) {
    const { filename, mimetype } = file;
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:
        mimetype === 'video/mp4'
          ? `user/products/videos/${filename}`
          : `user/products/images/${filename}`,
      ContentType: mimetype,
      // ACL: 'public-read',
    };
    return uploadParams;
  }
}
