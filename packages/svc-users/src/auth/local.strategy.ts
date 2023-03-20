import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '@betacall/svc-common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private users: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.users.findOne({
			login: username,
			password: this.users.getHash(password)
		});
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}