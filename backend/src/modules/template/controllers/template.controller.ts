import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomRequest } from 'src/shared/interfaces';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import {
  CreateTemplateDto,
  TemplateListQueryDto,
  UpdateTemplateDto,
} from '../dto/template.dto';
import { TemplateService } from '../services/template.service';

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async list(@Query() query: TemplateListQueryDto) {
    const result = await this.templateService.listPublic(query);
    return { templates: result.data, count: result.total };
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return { template: await this.templateService.findPublicBySlug(slug) };
  }

  @Get(':uid')
  async getByUid(@Param('uid') uid: string) {
    return { template: await this.templateService.findPublicByUid(uid) };
  }
}

@Controller('admin/templates')
@UseGuards(AuthGuard)
export class AdminTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async list(@Query() query: TemplateListQueryDto, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    const result = await this.templateService.listAdmin(query);
    return { templates: result.data, count: result.total };
  }

  @Get(':uid')
  async get(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { template: await this.templateService.findAdmin(uid) };
  }

  @Post()
  @HttpCode(201)
  async create(@Body() payload: CreateTemplateDto, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return {
      template: await this.templateService.create(payload, req.user.uid),
    };
  }

  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() payload: UpdateTemplateDto,
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return {
      template: await this.templateService.update(uid, payload, req.user.uid),
    };
  }

  @Post(':uid/preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) =>
        callback(
          null,
          ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype),
        ),
    }),
  )
  async uploadPreview(
    @Param('uid') uid: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number },
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return { template: await this.templateService.uploadPreview(uid, file) };
  }

  @Post(':uid/publish')
  async publish(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { template: await this.templateService.publish(uid, req.user.uid) };
  }

  @Post(':uid/disable')
  async disable(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { template: await this.templateService.disable(uid, req.user.uid) };
  }

  @Post(':uid/restore')
  async restore(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { template: await this.templateService.restore(uid, req.user.uid) };
  }

  @Delete(':uid')
  async remove(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return {
      template: await this.templateService.softDelete(uid, req.user.uid),
    };
  }

  private assertAdmin(req: CustomRequest): void {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('admin only');
    }
  }
}
