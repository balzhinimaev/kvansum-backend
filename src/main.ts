import 'reflect-metadata'; // первой строкой обязательно!
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Получаем ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS настройки
  app.enableCors({
    origin: configService.get<string[]>('cors.origins'),
    credentials: configService.get<boolean>('cors.credentials'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Kvansum API')
    .setDescription('Backend API для приложения отслеживания привычек Kvansum с системой уровней и прогрессии')
    .setVersion('2.0.0')
    .addTag('habits', 'Управление привычками')
    .addTag('levels', 'Система уровней прогрессии')
    .addTag('progress', 'Прогресс пользователя')
    .addTag('stats', 'Статистика и аналитика')
    .addTag('users', 'Пользователи')
    .addTag('thoughts', 'Мысли дня')
    .addTag('artefacts', 'Артефакты развития')
    .addTag('health', 'Health check')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Запускаем приложение
  await app.listen(port);

  logger.log(`✅ API running on http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔌 WebSocket server is ready`);
  logger.log(`📊 MongoDB connection established`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
