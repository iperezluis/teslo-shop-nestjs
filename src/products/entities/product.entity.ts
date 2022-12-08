import { ProductImage } from './product-image.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  //! cascade en true significa que cuando se elimine un product de la DB y las imagenes relacionadas a el tambien seran eliminadas(no se recomienda eliminar product solo desactivar para mantener la referencia en caso de ordenes de compra viejas)
  // ? eager en true es para que podamos cargar las relaciones de imagenes o cualquier producto en donde la especifiquemos usando cualquier find*
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    //logica sencilla atras si no viene entonces sera igual al title, ahora abajo ya el slug existe y haora validemos y reemplazamos los espacios y mas
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  UpdateSlugInsert() {
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
