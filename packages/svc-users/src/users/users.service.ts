import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { config, User } from '@betacall/svc-common';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    /** Add admin if not exists */
    const admin = await this.usersRepository.findOne({ where: {
      login: config.admin.login
    }})

    if (admin)
      return;
    
    this.save(config.admin);
  }

  findAll(where: Partial<User>): Promise<User[]> {
    return this.usersRepository.find({
      where
    });
  }

  findOne(where: Partial<User>): Promise<User> {
    return this.usersRepository.findOne({ 
      where
    });
  }

  getHash (str: string) {
    const hmac = createHmac("sha256", config.secret)
    hmac.update(str);
    return hmac.digest('hex')
  }

  async signup (user: Partial<User>) {
    if (user.id)
      throw new BadRequestException();

    if (!user.password)
      throw new BadRequestException()

    return this.save(user);
  }

  async save(_user: Partial<User>) {
    const user = { ..._user };
    
    if (user.password) {
      user.password = this.getHash(user.password)
    }

    if (user.id) {
      delete user.login
    }

    await this.usersRepository.save(user);
    delete user.password;
    return user;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}