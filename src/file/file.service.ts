import { Injectable, Param } from '@nestjs/common';
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

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}
  getStaticProductImage(imageName: string) {
    //verificar que el archivo existea sin importar que tipo de dato es
    const path = join(__dirname, '../../static/uploads', imageName);

    if (!existsSync(path)) {
      throw new Error(`Not product found with image ${imageName}`);
    }

    return path;
  }

  async upload(file: Express.Multer.File) {
    const { originalname = '', fieldname, path, filename } = file;
    const fileStream = createReadStream(path);
    // console.log(fileStream);
    const { ...params } = this.getParams(file);
    const command = new PutObjectCommand({ ...params, Body: fileStream });
    try {
      // await awsS3().
      const result = await awsS3().send(command);
      console.log({ result });
      return result;
      //code aws
      // const secureURL = `${this.configService.get(
      //   'HOST_NAME',
      // )}/file/product/${filename}`;
      // return secureURL;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
    });

    try {
      const images = await awsS3().send(command);
      let dataImages: string[] = [];
      const data = images.Contents.map((el) => {
        const secureURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazon.com/${el.Key}`;
        dataImages.push(secureURL);
      });
      console.log(images);
      return dataImages;
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

  async remove(@Param('key') key: string) {
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };
    try {
      const data = await awsS3().send(new DeleteObjectCommand(uploadParams));
      console.log({ data });
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  //clean code, don't repeat yourselft
  private getParams(file: Express.Multer.File) {
    const { filename, mimetype } = file;
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${filename}`,
      ContentType: mimetype,
      // ACL: 'public-read',
    };
    return uploadParams;
  }
}
