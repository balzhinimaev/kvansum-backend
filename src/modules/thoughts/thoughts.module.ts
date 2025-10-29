import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThoughtsController } from './thoughts.controller';
import { ThoughtsService } from './thoughts.service';
import { Thought, ThoughtSchema } from '../../common/schemas/thought.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Thought.name, schema: ThoughtSchema }]),
  ],
  controllers: [ThoughtsController],
  providers: [ThoughtsService],
  exports: [ThoughtsService],
})
export class ThoughtsModule {}

