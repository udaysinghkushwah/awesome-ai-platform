import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { SqlAnalyzerService } from './sql-analyzer.service';
import { ReviewController } from './review.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ReviewService, SqlAnalyzerService],
  controllers: [ReviewController],
})
export class ReviewModule {}
