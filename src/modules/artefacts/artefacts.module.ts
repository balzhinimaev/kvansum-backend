import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtefactsController } from './artefacts.controller';
import { ArtefactsService } from './artefacts.service';
import { Artefact, ArtefactSchema } from '../../common/schemas/artefact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Artefact.name, schema: ArtefactSchema }]),
  ],
  controllers: [ArtefactsController],
  providers: [ArtefactsService],
  exports: [ArtefactsService],
})
export class ArtefactsModule {}

