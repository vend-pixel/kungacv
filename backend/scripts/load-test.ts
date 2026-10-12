import { MongoMemoryServer } from 'mongodb-memory-server';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request = require('supertest');

const SAMPLE_SIZE = 10_000;
const QUERY_ROUNDS = 20;
const RATE_REQUESTS = 40;
const RATE_CONCURRENCY = 5;

type ExplainResult = {
  executionStats: {
    executionTimeMillis: number;
    totalDocsExamined: number;
    totalKeysExamined: number;
  };
};

const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
};

async function main() {
  const mongo = await MongoMemoryServer.create({
    instance: { dbName: 'kungacv_load_test' },
  });
  process.env.MONGO_URI = mongo.getUri().split('?')[0].replace(/\/$/, '');
  process.env.MONGO_DB_NAME = 'kungacv_load_test';
  process.env.JWT_SECRET = 'load-test-secret-that-is-long-enough-12345';
  process.env.NODE_ENV = 'test';
  process.env.PAYCHANGU_SECRET_KEY = 'load-test-only';

  const { AppModule } = await import('../src/app.module');
  const { Resume } = await import('../src/modules/resume/schema/resume.schema');
  const { Payment } =
    await import('../src/modules/payment/schema/payment.schema');
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0);
  const serverUrl = await app.getUrl();

  try {
    const resumeModel = app.get<Model<any>>(getModelToken(Resume.name));
    const paymentModel = app.get<Model<any>>(getModelToken(Payment.name));
    await resumeModel.insertMany(
      Array.from({ length: SAMPLE_SIZE }, (_, index) => ({
        resume_uid: `load-resume-${index}`,
        user_uid: `load-user-${index % 100}`,
        title: `Resume ${index}`,
        template: 'standard',
        content: {},
        updatedAt: new Date(Date.now() - index * 1000),
        createdAt: new Date(Date.now() - index * 1000),
      })),
    );
    await paymentModel.insertMany(
      Array.from({ length: SAMPLE_SIZE }, (_, index) => ({
        tx_ref: `load-payment-${index}`,
        user_uid: `load-user-${index % 100}`,
        user_email: `load-${index}@example.com`,
        plan: 'pro',
        amount: 5000,
        currency: 'MWK',
        status: index % 4 === 0 ? 'pending' : 'success',
        createdAt: new Date(Date.now() - index * 1000),
        updatedAt: new Date(Date.now() - index * 1000),
      })),
    );

    const explainResume = (await resumeModel
      .find({ user_uid: 'load-user-42' })
      .sort({ updatedAt: -1 })
      .limit(50)
      .explain('executionStats')) as unknown as ExplainResult;
    const explainPayment = (await paymentModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(50)
      .explain('executionStats')) as unknown as ExplainResult;

    const queryLatencies: number[] = [];
    for (let round = 0; round < QUERY_ROUNDS; round += 1) {
      const started = performance.now();
      await Promise.all([
        resumeModel
          .find({ user_uid: `load-user-${round % 100}` })
          .sort({ updatedAt: -1 })
          .limit(50)
          .lean(),
        paymentModel
          .find({ status: 'pending' })
          .sort({ createdAt: 1 })
          .limit(50)
          .lean(),
      ]);
      queryLatencies.push(performance.now() - started);
    }

    const rateStarted = performance.now();
    const rateResults: Array<
      { response: request.Response } | { error: string }
    > = [];
    for (let offset = 0; offset < RATE_REQUESTS; offset += RATE_CONCURRENCY) {
      const batch = await Promise.all(
        Array.from(
          { length: Math.min(RATE_CONCURRENCY, RATE_REQUESTS - offset) },
          () =>
            request(serverUrl)
              .post('/auth/login')
              .set('X-Forwarded-For', '198.51.100.10')
              .send({
                email: 'load@example.com',
                password: 'not-a-real-password',
              })
              .then((response) => ({ response }))
              .catch((error) => ({
                error: error instanceof Error ? error.message : String(error),
              })),
        ),
      );
      rateResults.push(...batch);
    }
    const rateDurationMs = performance.now() - rateStarted;
    const statusCounts = rateResults.reduce<Record<string, number>>(
      (counts, result) => {
        const status =
          'response' in result ? String(result.response.status) : 'error';
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      },
      {},
    );
    const rateErrors = rateResults
      .filter((result): result is { error: string } => 'error' in result)
      .map((result) => result.error);

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          dataset: { resumes: SAMPLE_SIZE, payments: SAMPLE_SIZE },
          indexedQueries: {
            resumeByOwnerAndRecency: explainResume.executionStats,
            pendingPaymentsByRecency: explainPayment.executionStats,
            pairedQueryLatencyMs: {
              p50: percentile(queryLatencies, 0.5),
              p95: percentile(queryLatencies, 0.95),
              max: Math.max(...queryLatencies),
            },
          },
          rateLimitedLogin: {
            requests: RATE_REQUESTS,
            concurrency: RATE_CONCURRENCY,
            durationMs: rateDurationMs,
            statusCounts,
            errors: rateErrors.slice(0, 3),
            expected429: true,
          },
          environment:
            'MongoMemoryServer; local synthetic benchmark, not production capacity evidence',
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
    await mongo.stop();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
