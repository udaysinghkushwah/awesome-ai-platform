import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { SqlAnalyzerService } from './sql-analyzer.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';
import { AnalyzeSqlDto } from './dto/analyze-sql.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../org/guards/org-membership.guard';

@Controller('orgs/:orgId/projects/:projectId/reviews')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly sqlAnalyzerService: SqlAnalyzerService,
  ) {}

  @Post('analyze')
  async analyzeCode(
    @Body() dto: AnalyzeCodeDto,
  ) {
    return this.reviewService.analyzeCode(dto);
  }

  @Post('sql')
  async analyzeSql(
    @Body() dto: AnalyzeSqlDto,
  ) {
    return this.sqlAnalyzerService.analyzeSql(dto);
  }
}
