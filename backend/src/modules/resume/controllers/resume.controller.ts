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
  UseGuards,
} from '@nestjs/common';

// INNER IMPORTS
import { CreateResumeDto, UpdateResumeDto } from '../dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ResumeService } from '../services/resume.service';
import { CustomRequest } from 'src/shared/interfaces';

@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Get('/')
  async list(@Req() req: CustomRequest) {
    return { resumes: await this.resumeService.list(req.user) };
  }

  @Post('/')
  async create(@Body() dto: CreateResumeDto, @Req() req: CustomRequest) {
    return { resume: await this.resumeService.create(req.user, dto) };
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
