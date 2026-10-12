// THIRD PARTY IMPORTS
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { hash, verify } from 'argon2';

// INNER IMPORTS
import { CustomRequest } from 'src/shared/interfaces';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RateLimit } from '../../../shared/guards/rate-limit.decorator';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @HttpCode(201)
  @RateLimit({ name: 'auth-signup', limit: 5, windowMs: 60_000 })
  async signUp(@Body() user: CreateUserDto) {
    user.deleted_at = null;
    user.deleted_by = null;
    user.active = true;

    const data = await this.authService.signUp(user);

    return data;
  }

  @Post('/login')
  @RateLimit({ name: 'auth-login', limit: 10, windowMs: 60_000 })
  async login(@Body() user: LoginUserDto) {
    const data = await this.authService.signIn(user);

    return data;
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: CustomRequest) {
    const userProfile = await this.authService.getPublicProfile(req.user.email);

    return userProfile;
  }

  @Patch('/update')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() payload: UpdateUserDto,
  ) {
    if (payload.password) {
      const user = await this.authService.getProfile(req.user.uid);
      const isPasswordMatch = await verify(user.password, payload.password);

      if (!isPasswordMatch) {
        throw new BadRequestException('wrong password');
      }

      if (payload.newPassword) {
        const newPassword = await hash(payload.newPassword);
        payload.password = newPassword;
      } else {
        delete payload.password;
      }
    }

    const updatedUser = await this.authService.updateUserProfile(
      payload,
      req.user,
    );

    return updatedUser;
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async deleteProfile(@Req() req: CustomRequest) {
    if (!req.user?.uid) {
      throw new BadRequestException('no uid provided');
    }

    await this.authService.deleteUserProfile(req.user.uid);

    return { delete: true, uid: req.user.uid };
  }
}
