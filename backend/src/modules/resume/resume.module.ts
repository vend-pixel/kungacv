// THIRD PARTY IMPORTS
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// INNER IMPORTS
import { ResumeController } from './controllers/resume.controller';
import { ResumeService } from './services/resume.service';
import { Resume, ResumeSchema } from './schema/resume.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('jsonwebtoken.jwt_secret'),
          signOptions: { expiresIn: '30d' },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
