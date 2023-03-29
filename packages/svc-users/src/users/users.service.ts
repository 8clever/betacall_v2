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

  static ROBOT_NAME = 'robot';

  async onModuleInit() {
    /** Add admin if not exists */
    const robotPassword = this.getHash(UsersService.ROBOT_NAME);

    const admin = await this.usersRepository.findOne({ where: {
      login: config.admin.login
    }})

    const robot = await this.usersRepository.findOne({ where: {
      login: UsersService.ROBOT_NAME
    }})

    if (!robot)
      await this.save({
        login: UsersService.ROBOT_NAME,
        password: robotPassword,
        role: User.Roles.ADMIN
      });

    if (!admin)
      await this.save({
        ...config.admin,
        role: User.Roles.ADMIN
      });
  }

  async findMany(where: Partial<User>, options: { skip?: number, limit?: number }) {


    const [ list, count ] = await this.usersRepository.findAndCount({
      where,
      take: options.limit,
      skip: options.skip
    });
    return {
      list,
      count
    }
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