export const PLACEHOLDER_JWT_SECRET = 'your_secret_key_change_me';

export function buildMongoUri(baseUri: string, databaseName: string): string {
  const uri = new URL(baseUri);
  if (!uri.pathname || uri.pathname === '/') {
    uri.pathname = `/${encodeURIComponent(databaseName)}`;
  }
  return uri.toString();
}

export function validateEnvironment(env: Record<string, unknown>) {
  const required = [
    ['MONGO_URI', env.MONGO_URI || env.MONGODB_URI],
    ['MONGO_DB_NAME', env.MONGO_DB_NAME],
    ['JWT_SECRET', env.JWT_SECRET],
  ] as const;
  const missing = required
    .filter(([, value]) => !String(value || '').trim())
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const nodeEnv = String(env.NODE_ENV || 'development');
  const jwtSecret = String(env.JWT_SECRET);
  if (
    nodeEnv === 'production' &&
    (jwtSecret === PLACEHOLDER_JWT_SECRET || jwtSecret.length < 32)
  ) {
    throw new Error(
      'JWT_SECRET must be a strong, non-placeholder secret in production',
    );
  }
  return env;
}

export default () => ({
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: process.env.PORT || process.env.SERVER_PORT || 3000,
  },
  mongo_db: {
    url: process.env.MONGO_URI || process.env.MONGODB_URI,
    db_name: process.env.MONGO_DB_NAME,
    auth_source: process.env.MONGO_AUTH_SOURCE,
    user: process.env.MONGO_USERNAME || process.env.MONGODB_USERNAME || '',
    password: process.env.MONGO_PASSWORD || process.env.MONGODB_PASSWORD || '',
  },
  jsonwebtoken: {
    jwt_secret: process.env.JWT_SECRET,
  },
  paychangu: {
    secret_key: process.env.PAYCHANGU_SECRET_KEY,
    webhook_secret:
      process.env.PAYCHANGU_WEBHOOK_SECRET || process.env.PAYCHANGU_SECRET_KEY,
    pro_price_mwk: Number(process.env.PAYCHANGU_PRO_PRICE_MWK) || 5000,
    pro_pass_days: Number(process.env.PAYCHANGU_PRO_PASS_DAYS) || 30,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'kungacv/templates',
  },
  client_url: process.env.CLIENT_URL || 'http://localhost:3001',
  cors_extra_origins: process.env.CORS_ORIGINS || '',
  admin_signup_token: process.env.ADMIN_SIGNUP_TOKEN,
  env: process.env.NODE_ENV || 'development',
});
