import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateProjectDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await this.prisma.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId: orgId,
          slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Project slug already exists in this organization');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        organizationId: orgId,
      },
    });
  }

  async list(orgId: string) {
    return this.prisma.project.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: orgId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
