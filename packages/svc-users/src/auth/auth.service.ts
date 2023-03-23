import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@betacall/svc-common';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {}

  async generateToken(user: User) {
    const payload = {
      id: user.id,
      login: user.login,
      role: user.role
    }
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(jwt: string) {
    try {
      const user = this.jwtService.verify(jwt);
      return user;
    } catch (e) {
      return {
        error: e.message
      }
    }
  }
}