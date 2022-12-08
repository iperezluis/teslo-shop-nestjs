import { Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}
  async fillDBSeed() {
    this.inserteNewProducts();

    return `Seed executed succefully`;
  }

  private async inserteNewProducts() {
    await this.productService.deleteAllProducts();
    // if (affected === 0) {
    //   throw new EntityNotFoundError(Product, {});
    // }
    const products = initialData.products;
    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product));
    });
    await Promise.all(insertPromises);
    return insertPromises;
  }
}
