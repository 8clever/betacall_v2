import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { config, mqttRegister } from '@betacall/svc-common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    ClientsModule.register([mqttRegister]),
    JwtModule.register({
      secret: config.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
