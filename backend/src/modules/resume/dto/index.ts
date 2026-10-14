// THIRD PARTY IMPORTS
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  template?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  template?: string;

  @IsObject()
  content: Record<string, any>;
}

export class ExportResumeDto {
  @IsObject()
  content: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPro?: boolean;
}
