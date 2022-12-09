import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      // secretOrKey: configService.get('JWT_SECRET'),
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwtPayload): Promise<User> {
    console.log('JWT_SECRET', process.env.JWT_SECRET);
    const { email } = payload;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException(`Token not valid`);

    if (!user.isActive)
      throw new UnauthorizedException('user is inactive, talk with an admin');

    return;
  }
}
