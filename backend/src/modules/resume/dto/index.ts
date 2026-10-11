// THIRD PARTY IMPORTS
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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
