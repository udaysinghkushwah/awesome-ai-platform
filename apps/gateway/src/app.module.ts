import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { ProjectModule } from './project/project.module';
import { AiModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { ReviewModule } from './review/review.module';
import { AgentModule } from './agent/agent.module';
import { PluginModule } from './plugin/plugin.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrgModule,
    ProjectModule,
    AiModule,
    SearchModule,
    ReviewModule,
    AgentModule,
    PluginModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

