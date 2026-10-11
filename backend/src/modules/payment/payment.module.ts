// THIRD PARTY IMPORTS
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

// INNER IMPORTS
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PayChanguService } from './services/paychangu.service';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { User, UserSchema } from 'src/modules/user/schemas/user.schema';
import {
  Purchase,
  PurchaseSchema,
} from 'src/modules/purchase/schema/purchase.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PayChanguService],
})
export class PaymentModule {}
