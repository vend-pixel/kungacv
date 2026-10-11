export default () => ({
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: process.env.PORT || process.env.SERVER_PORT || 3000,
  },
  mongo_db: {
    url: process.env.MONGO_URI,
    db_name: process.env.MONGO_DB_NAME,
    auth_source: process.env.MONGO_AUTH_SOURCE,
    user: process.env.MONGO_USERNAME || '',
    password: process.env.MONGO_PASSWORD || '',
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
  client_url: process.env.CLIENT_URL || 'http://localhost:3001',
  cors_extra_origins: process.env.CORS_ORIGINS || '',
  admin_signup_token: process.env.ADMIN_SIGNUP_TOKEN,
  env: process.env.NODE_ENV,
});
