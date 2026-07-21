import { Module } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AgentController } from './agent.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [AgentOrchestratorService],
  controllers: [AgentController],
})
export class AgentModule {}
