// THIRD PARTY IMPORTS
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// INNER IMPORTS
import appConfig, {
  buildMongoUri,
  validateEnvironment,
} from 'config/app.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ResumeModule } from './modules/resume/resume.module';
import { HealthController } from './health.controller';
import { RateLimitGuard } from './shared/guards/rate-limit.guard';
import { MediaModule } from './modules/media/media.module';
import { TemplateModule } from './modules/template/template.module';

@Module({
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: RateLimitGuard }],
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Import the ConfigModule
      useFactory: async (configService: ConfigService) => {
        const options: any = {
          uri: buildMongoUri(
            configService.get('mongo_db.url'),
            configService.get('mongo_db.db_name'),
          ),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
        const authSource = configService.get('mongo_db.auth_source');
        const username = configService.get('mongo_db.user');
        const password = configService.get('mongo_db.password');
        if (authSource) options.authSource = authSource;
        if (username) options.user = username;
        if (password) options.pass = password;
        return options;
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AdminModule,
    SubscriptionModule,
    PurchaseModule,
    PaymentModule,
    ResumeModule,
    MediaModule,
    TemplateModule,
  ],
})
export class AppModule {}
