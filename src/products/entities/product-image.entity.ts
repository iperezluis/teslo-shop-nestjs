import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  // many to one, muchas images de un producto
  @ManyToOne(() => Product, (product) => product.images, {
    //cuando activamos 'cascada' y eliminamos un product tambien se eliminen las tablas(esta tabla) relacionadas a el
    onDelete: 'CASCADE',
  })
  product: Product;
}
