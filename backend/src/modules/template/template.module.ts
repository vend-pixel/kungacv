import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscription/schemas/subscriptions.schema';
import {
  AdminTemplateController,
  TemplateController,
} from './controllers/template.controller';
import { Template, TemplateSchema } from './schemas/template.schema';
import { TemplateService } from './services/template.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jsonwebtoken.jwt_secret'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [TemplateController, AdminTemplateController],
  providers: [TemplateService, AuthGuard],
  exports: [TemplateService],
})
export class TemplateModule {}
