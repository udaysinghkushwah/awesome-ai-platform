import { Controller, Get, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ElasticsearchService } from '@awesome-ai/database';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../org/guards/org-membership.guard';

@Controller('orgs/:orgId/projects/:projectId/search')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class SearchController {
  private readonly elasticsearch = new ElasticsearchService();

  constructor(private readonly aiService: AiService) {}

  @Get()
  async search(
    @Param('projectId') projectId: string,
    @Query('q') query: string,
  ) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }

    const queryVector = await this.aiService.getEmbedding(query);

    const results = await this.elasticsearch.searchChunks(
      'code-chunks',
      projectId,
      queryVector,
      5,
    );

    return results;
  }
}
