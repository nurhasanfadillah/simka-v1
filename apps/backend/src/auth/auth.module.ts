import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RbacGuard } from './guards/rbac.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as any },
      }),
    }),
  ],
  controllers: [AuthController, UsersController, RolesController],
  providers: [AuthService, UsersService, RolesService, JwtStrategy, JwtAuthGuard, RbacGuard],
  exports: [JwtAuthGuard, RbacGuard, JwtModule],
})
export class AuthModule {}
