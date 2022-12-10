import { Controller, Post } from '@nestjs/common';
import { Auth, ValidRoles } from 'src/auth/decorators';
import { SeedService } from './seed.service';
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @Auth(ValidRoles.admin)
  fillSeedDB() {
    return this.seedService.fillDBSeed();
  }
}
