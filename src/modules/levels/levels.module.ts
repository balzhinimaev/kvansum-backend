import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { Level, LevelSchema } from '../../common/schemas/level.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }])],
  controllers: [LevelsController],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}

