import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.orgId || request.body.organizationId || request.query.organizationId;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!orgId) {
      throw new ForbiddenException('Organization context (orgId) is required');
    }

    if (user.organizationId !== orgId) {
      throw new ForbiddenException('You do not belong to this organization workspace');
    }

    return true;
  }
}
