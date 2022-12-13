import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async fillDBSeed() {
    await this.deleteTables();

    const user = await this.insertUsers();
    await this.inserteNewProducts(user);

    return `Seed executed succefully`;
  }

  private async deleteTables() {
    //first we must delete all products within database cause all of them have relations
    await this.productService.deleteAllProducts();
    //now we delete all users with Query builder
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }
  private async insertUsers() {
    const users = initialData.users;
    const newUsers: User[] = [];

    users.forEach((user) => {
      {
        newUsers.push(this.userRepository.create(user));
      }
    });

    await this.userRepository.save(users);

    return newUsers[0];
  }
  private async inserteNewProducts(user: User) {
    // await this.productService.deleteAllProducts();
    // if (affected === 0) {
    //   throw new EntityNotFoundError(Product, {});
    // }
    const products = initialData.products;
    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);
    return insertPromises;
  }
}
