import { Module, NestModule, MiddlewareConsumer, forwardRef, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './modules/health/health.module';
import { HabitsModule } from './modules/habits/habits.module';
import { LevelsModule } from './modules/levels/levels.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { ThoughtsModule } from './modules/thoughts/thoughts.module';
import { ArtefactsModule } from './modules/artefacts/artefacts.module';
import { AuthModule } from './modules/auth/auth.module';
import { PartyModule } from './modules/party/party.module';
import { WebSocketsModule } from './common/websockets/websockets.module';
import configuration from './config/configuration';

const logger = new Logger('AppModule');

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
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        const dbName = configService.get<string>('database.dbName');
        
        logger.log(`🗄️  Connecting to MongoDB...`);
        logger.log(`   URI: ${uri?.substring(0, 20)}...`);
        logger.log(`   DB Name: ${dbName}`);
        
        return {
          uri,
          dbName,
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),

    // WebSocket
    WebSocketsModule,

    // Модули приложения
    HealthModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    LevelsModule,
    StatsModule,
    ThoughtsModule,
    ArtefactsModule,
    PartyModule,
  ],
})
export class AppModule {}
