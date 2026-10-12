import {
  PLACEHOLDER_JWT_SECRET,
  buildMongoUri,
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

  it('accepts Atlas-generated MongoDB variable names', () => {
    expect(
      validateEnvironment({
        MONGODB_URI: valid.MONGO_URI,
        MONGO_DB_NAME: valid.MONGO_DB_NAME,
        JWT_SECRET: valid.JWT_SECRET,
      }),
    ).toBeTruthy();
  });

  it('adds the database name before Atlas query parameters', () => {
    expect(
      buildMongoUri(
        'mongodb+srv://user:password@cluster.mongodb.net/?appName=kungacv',
        'kungacv',
      ),
    ).toBe(
      'mongodb+srv://user:password@cluster.mongodb.net/kungacv?appName=kungacv',
    );
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
