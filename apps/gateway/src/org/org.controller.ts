import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { OrgService } from './org.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from './guards/org-membership.guard';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get()
  async listMyOrgs(@Request() req: any) {
    return this.orgService.listUserOrgs(req.user.id);
  }

  @UseGuards(OrgMembershipGuard)
  @Get(':orgId')
  async getOrg(@Param('orgId') orgId: string) {
    return this.orgService.findOne(orgId);
  }
}
