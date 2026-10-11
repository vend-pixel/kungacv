// THIRD PARTY IMPORTS
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

// INNER IMPORTS
import { Resume } from '../schema/resume.schema';
import { CreateResumeDto, UpdateResumeDto } from '../dto';

@Injectable()
export class ResumeService {
  constructor(@InjectModel(Resume.name) private resumeModel: Model<Resume>) {}

  async list(user: any) {
    return this.resumeModel
      .find({ user_uid: user.uid })
      .sort({ updatedAt: -1 })
      .select('-content')
      .lean();
  }

  async create(user: any, dto: CreateResumeDto) {
    const payload = {
      resume_uid: nanoid(),
      user_uid: user.uid,
      title: dto.title?.trim() || 'Untitled resume',
      template: dto.template || 'standard',
      content: dto.content || {},
    };
    return this.resumeModel.create(payload);
  }

  async getOne(user: any, resumeUid: string) {
    const resume = await this.resumeModel.findOne({
      resume_uid: resumeUid,
      user_uid: user.uid,
    });
    if (!resume) {
      throw new NotFoundException('resume not found');
    }
    return resume;
  }

  async update(user: any, resumeUid: string, dto: UpdateResumeDto) {
    const resume = await this.getOne(user, resumeUid);
    if (dto.title !== undefined) {
      resume.title = dto.title.trim() || 'Untitled resume';
    }
    if (dto.template !== undefined) {
      resume.template = dto.template;
    }
    resume.content = dto.content;
    return resume.save();
  }

  async remove(user: any, resumeUid: string) {
    const resume = await this.getOne(user, resumeUid);
    await resume.deleteOne();
    return { resume_uid: resume.resume_uid, deleted: true };
  }

  async duplicate(user: any, resumeUid: string) {
    const source = await this.getOne(user, resumeUid);
    return this.resumeModel.create({
      resume_uid: nanoid(),
      user_uid: user.uid,
      title: `Copy of ${source.title}`,
      template: source.template,
      content: source.content || {},
    });
  }
}
