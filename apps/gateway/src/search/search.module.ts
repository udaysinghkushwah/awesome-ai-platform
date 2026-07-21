import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SearchController],
})
export class SearchModule {}
