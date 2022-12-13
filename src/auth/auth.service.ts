import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      const token = this.getJwtToken({ id: user.id });
      delete user.password;
      return { ...user, token };
    } catch (error) {
      console.log(error);
      this.handleErrors(error);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      // const user = await this.userRepository.findOne({ where: { email}, select: { email: true, password: true} });
      const user = await this.userRepository.findOne({
        where: { email },
        select: { id: true, email: true, password: true },
      });
      console.log(user);
      if (!user) {
        throw new UnauthorizedException(`credentials are not valid (email)`);
      }
      // if (!user.password) return;
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(`credentials are no valid (password)`);
      }
      const token = this.getJwtToken({ id: user.id });
      return {
        ...user,
        token: token,
      };
    } catch (error) {
      console.log(error);
      this.handleErrors(error);
    }
  }
  async checkAuthStatus(user: User) {
    const token = this.getJwtToken({ id: user.id });
    return {
      ...user,
      token: token,
    };
  }
  //TODO build app with dynamoDB and insert SDK
  //TODO fix the issue from NextAuth within SPace-Shop now!

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      // expiresIn: '2 days',
    });
    return token;
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException(error.message);
  }
}
