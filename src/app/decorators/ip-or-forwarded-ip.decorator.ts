import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { getClientIp } from 'request-ip';

/**
 * Returns the remote IP address, checking multiple sources (x-forwarded-for header, remote socket
 * address, etc.). Returns null if no value can be found.
 */
export const IpOrForwardedIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest();
    return getClientIp(req);
  },
);
