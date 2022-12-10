import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { RowHeaders, GetUser } from './decorators/';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

import { ValidRoles } from './interfaces';
import { Auth } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('private')
  @UseGuards(AuthGuard())
  checkPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @RowHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return { user, rawHeaders, headers };
  }

  // Rutas protegidas usamos guards y guards personalizados por role etc
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin, ValidRoles.superuser, ValidRoles.seo)
  @UseGuards(AuthGuard(), UserRoleGuard)
  checkPrivate(@GetUser() user: User) {
    return user;
  }
  //Ahora aqui con la composicion de decoradores
  @Get('videos')
  @Auth(ValidRoles.creator)
  checkPrivate2(@GetUser() user: User) {
    return user;
  }
  @Get('users')
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
