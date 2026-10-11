// THIRD PARTY IMPORTS
import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
  Get,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { hash } from 'argon2';

// INNER IMPORTS
import { CustomRequest, Query as IQuery } from 'src/shared/interfaces';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { AdminService } from '../services/admin.service';
import { UserService } from 'src/modules/user/services/user.service';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto';

@Controller('admin')
export class AdminController {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  // AUTH
  @Post('/login')
  async login(@Body() payload: LoginUserDto) {
    const loginAdmin = await this.authService.signIn(payload, 'admin');

    return loginAdmin;
  }

  @Post('/signup')
  @HttpCode(201)
  async signUp(
    @Body() payload: CreateUserDto,
    @Headers('x-admin-signup-token') token?: string,
  ) {
    const expected = this.configService.get('admin_signup_token');

    if (!expected || !this.tokensMatch(String(token || ''), String(expected))) {
      throw new ForbiddenException({
        message: 'admin signup is disabled (set ADMIN_SIGNUP_TOKEN)',
      });
    }

    const createdAdmin = await this.authService.signUp(payload, 'admin');

    return createdAdmin;
  }

  private tokensMatch(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }

  // MAIN FUNCTIONS
  @Post('/create-user')
  @HttpCode(201)
  @UseGuards(AuthGuard)
  async createUser(@Body() payload: CreateUserDto, @Req() req: CustomRequest) {
    if (req?.user?.role !== 'admin') {
      throw new UnauthorizedException({ message: 'admin only' });
    }

    if (payload.password) {
      payload.password = await hash(payload.password);
    }

    const createdUser = await this.authService.signUp(
      payload,
      payload.role || 'user',
    );

    return { user: createdUser };
  }

  @UseGuards(AuthGuard)
  @Get(['/get-users', '/get-users/:userId'])
  async getUsers(
    @Query() query: IQuery,
    @Req() req: CustomRequest,
    @Param('userId') userId: string | null = null,
  ) {
    if (req?.user?.role !== 'admin') {
      throw new UnauthorizedException({ message: 'admin only' });
    }

    const parsedQuery = this.adminService.getParsedQuery(query);

    if (userId) {
      parsedQuery.uid = [userId];
    }

    const allUsers = await this.userService.getAllUsers(parsedQuery);
    const retObj: any = { users: allUsers };

    if (query.count) {
      retObj.count = (retObj.users || []).length;
    }

    return retObj;
  }

  @Patch('/update-user/:userId')
  @UseGuards(AuthGuard)
  async updateUser(
    @Body() payload: UpdateUserDto,
    @Param('userId') userId: string,
    @Req() req: CustomRequest,
  ) {
    if (req?.user?.role !== 'admin') {
      throw new UnauthorizedException({
        message: "user cannot edit other users' profile",
      });
    }

    if ([true, 'true'].includes(payload['active'])) {
      payload.deleted_at = null;
      payload.deleted_by = null;
    }

    if (payload.password) {
      payload.password = await hash(payload.password);
    }

    const updatedUser = await this.adminService.updateUser(userId, payload);

    return { user: updatedUser };
  }

  @Delete('/delete-user/:userId')
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async deleteUser(@Param('userId') userId: string, @Req() req: CustomRequest) {
    if (req?.user?.role !== 'admin') {
      throw new UnauthorizedException({
        message: 'user cannot delete or update other users',
      });
    }

    return await this.adminService.updateUser(userId, {
      active: false,
      deleted_at: new Date(),
      deleted_by: req.user.uid,
    });
  }
}
