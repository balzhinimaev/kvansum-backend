export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kvansum',
    dbName: process.env.DB_NAME || 'kvansum',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development', // В продакшене используйте переменную окружения
    expiresIn: process.env.JWT_EXPIRATION_TIME || '3600s', // 1 час
  },
});

