// THIRD PARTY IMPORTS
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';

// INNER IMPORTS
import { UserService } from 'src/modules/user/services/user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginObj: LoginUserDto, role = 'user') {
    const user = await this.userService.findOne({
      email: loginObj.email,
      role,
      active: true,
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'email or password incorrect',
      });
    }

    const verifyPassword = await verify(user.password, loginObj.password);

    if (!verifyPassword) {
      throw new UnauthorizedException({
        message: 'email or password incorrect',
      });
    }

    const claims = {
      email: user.email,
      name: user.name,
      uid: user.uid,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(claims),
      user: { ...claims, isPro: this.hasActivePro(user) },
    };
  }

  async signUp(userObj: CreateUserDto, role = 'user') {
    userObj.role = role;
    userObj.password = await hash(userObj.password);

    const user = await this.userService.createUser(userObj);

    const claims = {
      email: user.email,
      name: user.name,
      uid: user.uid,
      role: user.role,
      active: true,
    };

    return {
      access_token: await this.jwtService.signAsync(claims),
      user: { ...claims, isPro: this.hasActivePro(user) },
    };
  }

  // Entitlement is only active while the paid pass has not expired.
  private hasActivePro(user: any): boolean {
    if (!user?.isPro) return false;
    if (!user?.proExpiresAt) return true;
    return new Date(user.proExpiresAt).getTime() > Date.now();
  }

  async getProfile(uid: string) {
    const user = await this.userService.findOne({ uid });

    if (!user) {
      throw new BadRequestException({
        message: 'no user found with give email',
      });
    }

    return user;
  }

  async updateUserProfile(payload: UpdateUserDto, user: any) {
    if (user.role !== 'admin') {
      if (payload.role) {
        throw new UnauthorizedException({
          message: 'only admin can update role key',
        });
      }

      if (payload.active !== undefined) {
        throw new UnauthorizedException({
          message: 'only admin can update active key',
        });
      }

      if (
        payload.deleted_at !== undefined ||
        payload.deleted_by !== undefined
      ) {
        throw new UnauthorizedException({
          message: 'only admin can update delete flags',
        });
      }
    }

    const updatedUser = await this.userService.updateUser(payload, {
      email: user.email,
      uid: user.uid,
    });

    return updatedUser;
  }

  async deleteUserProfile(uid: string) {
    await this.userService.updateUser(
      { active: false, deleted_by: uid, deleted_at: new Date() },
      { uid },
    );
  }
}
