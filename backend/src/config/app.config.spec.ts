import {
  PLACEHOLDER_JWT_SECRET,
  validateEnvironment,
} from '../../config/app.config';

describe('validateEnvironment', () => {
  const valid = {
    MONGO_URI: 'mongodb://localhost:27017',
    MONGO_DB_NAME: 'kungacv',
    JWT_SECRET: 'a'.repeat(40),
  };

  it('accepts complete development configuration', () => {
    expect(validateEnvironment(valid)).toBe(valid);
  });

  it('rejects missing required configuration', () => {
    expect(() => validateEnvironment({ ...valid, JWT_SECRET: '' })).toThrow(
      'JWT_SECRET',
    );
  });

  it('rejects the placeholder secret in production', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        NODE_ENV: 'production',
        JWT_SECRET: PLACEHOLDER_JWT_SECRET,
      }),
    ).toThrow('strong, non-placeholder');
  });
});
