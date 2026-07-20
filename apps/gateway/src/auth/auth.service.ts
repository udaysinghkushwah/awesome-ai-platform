import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create default Organization
      const name = dto.firstName ? `${dto.firstName}'s Personal Space` : 'Default Workspace';
      const slug = `${dto.email.split('@')[0]}-org-${Math.random().toString(36).substring(2, 7)}`;
      
      const org = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      // 2. Create User linked to Organization
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          organizationId: org.id,
        },
      });

      // 3. Link User as member of a Default Team
      await tx.team.create({
        data: {
          name: 'General',
          organizationId: org.id,
          users: {
            connect: { id: user.id },
          },
        },
      });

      // Issue token
      const token = this.generateToken(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
        },
        token,
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
      },
      token,
    };
  }

  private generateToken(user: { id: string; email: string }) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
