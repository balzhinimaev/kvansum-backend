import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './modules/health/health.module';
import { HabitsModule } from './modules/habits/habits.module';
import { LevelsModule } from './modules/levels/levels.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { ThoughtsModule } from './modules/thoughts/thoughts.module';
import { ArtefactsModule } from './modules/artefacts/artefacts.module';
import { WebSocketsModule } from './common/websockets/websockets.module';
import { UserMiddleware } from './common/middleware/user.middleware';
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
        dbName: configService.get<string>('database.dbName'),
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),

    // WebSocket
    WebSocketsModule,

    // Модули приложения
    HealthModule,
    UsersModule,
    HabitsModule,
    LevelsModule,
    StatsModule,
    ThoughtsModule,
    ArtefactsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .exclude('health')
      .forRoutes('*');
  }
}
