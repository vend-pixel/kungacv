import { UserSchema } from './modules/user/schemas/user.schema';
import { ResumeSchema } from './modules/resume/schema/resume.schema';
import { PaymentSchema } from './modules/payment/schema/payment.schema';
import { PurchaseSchema } from './modules/purchase/schema/purchase.schema';
import { SubscriptionSchema } from './modules/subscription/schemas/subscriptions.schema';

const hasIndex = (schema: any, fields: Record<string, number>) =>
  schema
    .indexes()
    .some(([indexedFields]: [Record<string, number>]) =>
      Object.entries(fields).every(
        ([field, direction]) => indexedFields[field] === direction,
      ),
    );

describe('production database indexes', () => {
  it('indexes user authentication and admin filters', () => {
    expect(hasIndex(UserSchema, { email: 1 })).toBe(true);
    expect(hasIndex(UserSchema, { active: 1, email: 1 })).toBe(true);
    expect(hasIndex(UserSchema, { active: 1, name: 1 })).toBe(true);
  });

  it('indexes resume ownership and recency queries', () => {
    expect(hasIndex(ResumeSchema, { user_uid: 1, updatedAt: -1 })).toBe(true);
    expect(hasIndex(ResumeSchema, { resume_uid: 1, user_uid: 1 })).toBe(true);
  });

  it('indexes payment and purchase reconciliation paths', () => {
    expect(hasIndex(PaymentSchema, { user_uid: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(PaymentSchema, { status: 1, createdAt: 1 })).toBe(true);
    expect(
      hasIndex(PurchaseSchema, { user_uid: 1, active: 1, purchased_date: -1 }),
    ).toBe(true);
  });

  it('indexes subscription list filters', () => {
    expect(hasIndex(SubscriptionSchema, { active: 1, name: 1 })).toBe(true);
    expect(hasIndex(SubscriptionSchema, { active: 1, price: 1 })).toBe(true);
  });
});
