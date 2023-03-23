import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@betacall/svc-common';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {}

  async generateToken(user: User) {
    return {
      access_token: this.jwtService.sign(user),
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