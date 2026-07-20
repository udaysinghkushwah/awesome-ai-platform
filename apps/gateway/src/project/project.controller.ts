import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../org/guards/org-membership.guard';

@Controller('orgs/:orgId/projects')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Param('orgId') orgId: string, @Body() dto: CreateProjectDto) {
    return this.projectService.create(orgId, dto);
  }

  @Get()
  async list(@Param('orgId') orgId: string) {
    return this.projectService.list(orgId);
  }

  @Get(':projectId')
  async findOne(@Param('orgId') orgId: string, @Param('projectId') projectId: string) {
    return this.projectService.findOne(orgId, projectId);
  }
}
