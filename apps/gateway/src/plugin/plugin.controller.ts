import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { RegisterPluginDto } from './dto/register-plugin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../org/guards/org-membership.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get('plugins')
  async listPlugins() {
    return this.pluginService.listPlugins();
  }

  @Post('plugins')
  async registerPlugin(@Body() dto: RegisterPluginDto) {
    return this.pluginService.registerPlugin(dto);
  }

  @Post('orgs/:orgId/projects/:projectId/plugins/:pluginId/install')
  @UseGuards(OrgMembershipGuard)
  async installPlugin(
    @Param('projectId') projectId: string,
    @Param('pluginId') pluginId: string,
  ) {
    return this.pluginService.installPlugin(projectId, pluginId);
  }

  @Get('orgs/:orgId/projects/:projectId/plugins')
  @UseGuards(OrgMembershipGuard)
  async listProjectPlugins(
    @Param('projectId') projectId: string,
  ) {
    return this.pluginService.listProjectPlugins(projectId);
  }
}
