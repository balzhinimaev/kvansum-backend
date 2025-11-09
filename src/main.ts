import 'reflect-metadata'; // первой строкой обязательно!
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    }).then((app) => {
      console.log('[DEBUG] NestFactory.create() promise resolved');
      logger.log('✓ NestFactory.create() promise resolved');
      return app;
    });
    console.log('[DEBUG] Application instance received');
    logger.log('✓ Application instance received');
    logger.log('Application created successfully');

    // Получаем ConfigService
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port', 3001);
    const nodeEnv = configService.get<string>('nodeEnv', 'development');
    logger.log(`Configuration loaded - Port: ${port}, Environment: ${nodeEnv}`);

    // Глобальная валидация
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // CORS настройки
    const corsEnabled = configService.get<boolean>('cors.enabled', true);
    if (corsEnabled) {
      app.enableCors({
        origin: configService.get<string[]>('cors.origins'),
        credentials: configService.get<boolean>('cors.credentials'),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'Accept',
          'X-Telegram-Init-Data', // Для Telegram Web App аутентификации
          'X-User-Id',            // Для development режима
        ],
      });
      logger.log('CORS enabled');
    } else {
      logger.warn('CORS disabled');
    }

    // Swagger документация
    const config = new DocumentBuilder()
      .setTitle('Kvansum API')
      .setDescription('Backend API для приложения отслеживания привычек Kvansum с системой уровней и прогрессии')
      .setVersion('2.0.0')
      .addTag('auth', 'Аутентификация')
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
    logger.log('Swagger documentation configured');

    // Запускаем приложение
    logger.log(`Starting server on port ${port}...`);
    await app.listen(port);
    logger.log(`Server is listening on port ${port}`);

    logger.log(`✅ API running on http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`🔌 WebSocket server is ready`);
    logger.log(`📊 MongoDB connection established`);
  } catch (error) {
    logger.error('❌ Error during bootstrap:', error);
    throw error;
  }
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  console.error('Stack trace:', err?.stack);
  process.exit(1);
});
