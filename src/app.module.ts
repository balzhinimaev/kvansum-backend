import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './modules/health/health.module';
import { HabitsModule } from './modules/habits/habits.module';
import { WebSocketsModule } from './common/websockets/websockets.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MongoDB подключение
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),

    // WebSocket
    WebSocketsModule,

    // Модули приложения
    HealthModule,
    HabitsModule,
  ],
})
export class AppModule {}
