import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party, PartySchema } from '../../common/schemas/party.schema';
import { User, UserSchema } from '../../common/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Party.name, schema: PartySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PartyController],
  providers: [PartyService],
  exports: [PartyService],
})
export class PartyModule {}

