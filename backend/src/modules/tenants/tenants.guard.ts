import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const rawHeader = req.headers['x-microservice-token'] || req.headers['authorization'];
    
    let token = '';
    if (typeof rawHeader === 'string') {
      token = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim();
    }

    const expectedToken = (process.env.INTERNAL_MICROSERVICE_TOKEN || process.env.JWT_SECRET || '').trim();

    if (!expectedToken) {
      throw new UnauthorizedException('Internal microservice authentication is not configured on backend');
    }

    if (!token) {
      throw new UnauthorizedException('Missing internal microservice authentication token');
    }

    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expectedToken);

    // Constant-time comparison to prevent side-channel timing attacks
    if (tokenBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      throw new UnauthorizedException('Invalid internal microservice authentication token');
    }

    return true;
  }
}
