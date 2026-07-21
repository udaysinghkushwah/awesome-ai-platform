import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentTaskDto } from './dto/agent-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../org/guards/org-membership.guard';

@Controller('orgs/:orgId/projects/:projectId/agents')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class AgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post('execute')
  async executeTask(@Body() dto: AgentTaskDto) {
    return this.orchestrator.executeTask(dto);
  }
}
