import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        projects: true,
        teams: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async listUserOrgs(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        organization: true,
      },
    });

    return user?.organization ? [user.organization] : [];
  }
}
