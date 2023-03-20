import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@betacall/svc-common';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {}

  async generateToken(user: User) {
    const payload = { username: user.login, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(jwt: string) {
    try {
      const verify = this.jwtService.verify(jwt);
      const user = { id: verify.sub, login: verify.username }
      return user;
    } catch (e) {
      return {
        error: e.message
      }
    }
  }
}