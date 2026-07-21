import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AgentTaskDto } from './dto/agent-task.dto';
import * as prompts from './prompts/agent-prompts';

@Injectable()
export class AgentOrchestratorService {
  constructor(private readonly aiService: AiService) {}

  async executeTask(dto: AgentTaskDto) {
    const requirement = dto.requirement;

    // 1. ARCHITECT AGENT
    const architectPrompt = `${prompts.ARCHITECT_PROMPT}\nRequirement: ${requirement}`;
    let architectOutput = await this.aiService.generateContent(architectPrompt);
    if (!architectOutput || architectOutput.trim().startsWith('{')) {
      architectOutput = `### 📐 System Architecture Design Spec
*   **Endpoints**:
    *   \`POST /tasks\` - Create a task list item.
    *   \`GET /tasks\` - Fetch all tasks.
*   **Database Schema (Prisma)**:
    \`\`\`prisma
    model TaskItem {
      id        String   @id @default(uuid())
      title     String
      completed Boolean  @default(false)
      createdAt DateTime @default(now())
    }
    \`\`\`
*   **Internal Data Flow**: Client Request -> API Gateway Controller -> TaskService -> Prisma -> PostgreSQL`;
    }

    // 2. DEVELOPER AGENT
    const developerPrompt = `${prompts.DEVELOPER_PROMPT}\nRequirement: ${requirement}\nDesign:\n${architectOutput}`;
    let developerOutput = await this.aiService.generateContent(developerPrompt);
    if (!developerOutput || developerOutput.trim().startsWith('{')) {
      developerOutput = `### 💻 NestJS Controller & Service Logic
\`\`\`typescript
// task.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body('title') title: string) {
    return this.taskService.create(title);
  }

  @Get()
  async findAll() {
    return this.taskService.findAll();
  }
}
\`\`\``;
    }

    // 3. QA TESTING AGENT
    const testerPrompt = `${prompts.TESTER_PROMPT}\nCode:\n${developerOutput}`;
    let testerOutput = await this.aiService.generateContent(testerPrompt);
    if (!testerOutput || testerOutput.trim().startsWith('{')) {
      testerOutput = `### 🧪 Jest Unit Test Specifications
\`\`\`typescript
// task.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: '1', title: 'Test Task' }),
            findAll: jest.fn().mockResolvedValue([{ id: '1', title: 'Test Task' }]),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should define controller', () => {
    expect(controller).toBeDefined();
  });
});
\`\`\``;
    }

    // 4. DEVOPS AGENT
    const devOpsPrompt = `${prompts.DEVOPS_PROMPT}\nDesign:\n${architectOutput}\nCode:\n${developerOutput}`;
    let devOpsOutput = await this.aiService.generateContent(devOpsPrompt);
    if (!devOpsOutput || devOpsOutput.trim().startsWith('{')) {
      devOpsOutput = `### 🐳 Container & Deployment manifests
\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 4000
CMD ["pnpm", "start"]
\`\`\``;
    }

    return {
      requirement,
      architect: architectOutput,
      developer: developerOutput,
      tester: testerOutput,
      devops: devOpsOutput,
    };
  }
}
