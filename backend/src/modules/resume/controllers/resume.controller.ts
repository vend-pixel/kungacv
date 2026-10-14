// THIRD PARTY IMPORTS
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

// INNER IMPORTS
import { CreateResumeDto, ExportResumeDto, UpdateResumeDto } from '../dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ResumeService } from '../services/resume.service';
import { ResumeExportService } from '../services/resume-export.service';
import { CustomRequest } from 'src/shared/interfaces';

@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumeController {
  constructor(
    private resumeService: ResumeService,
    private resumeExportService: ResumeExportService,
  ) {}

  @Get('/')
  async list(@Req() req: CustomRequest) {
    return { resumes: await this.resumeService.list(req.user) };
  }

  @Post('/')
  async create(@Body() dto: CreateResumeDto, @Req() req: CustomRequest) {
    return { resume: await this.resumeService.create(req.user, dto) };
  }

  @Post('/export')
  async export(
    @Body() dto: ExportResumeDto,
    @Req() req: CustomRequest,
    @Res() response: Response,
  ) {
    const pdf = await this.resumeExportService.renderPdf(
      dto.content,
      Boolean(dto.isPro && req.user?.isPro),
    );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="kungacv-resume.pdf"',
      'Content-Length': pdf.length,
      'Cache-Control': 'no-store',
    });
    response.end(pdf);
  }

  @Get('/:resumeUid')
  async getOne(
    @Param('resumeUid') resumeUid: string,
    @Req() req: CustomRequest,
  ) {
    return { resume: await this.resumeService.getOne(req.user, resumeUid) };
  }

  @Put('/:resumeUid')
  async update(
    @Param('resumeUid') resumeUid: string,
    @Body() dto: UpdateResumeDto,
    @Req() req: CustomRequest,
  ) {
    return {
      resume: await this.resumeService.update(req.user, resumeUid, dto),
    };
  }

  @Delete('/:resumeUid')
  async remove(
    @Param('resumeUid') resumeUid: string,
    @Req() req: CustomRequest,
  ) {
    return { resume: await this.resumeService.remove(req.user, resumeUid) };
  }

  @Post('/:resumeUid/duplicate')
  async duplicate(
    @Param('resumeUid') resumeUid: string,
    @Req() req: CustomRequest,
  ) {
    return { resume: await this.resumeService.duplicate(req.user, resumeUid) };
  }
}
