/* eslint-disable class-methods-use-this */
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { relativeToFullImagePath } from '../utils/image-utils';
import { IpOrForwardedIp } from './decorators/ip-or-forwarded-ip.decorator';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) { }

  // This route handler only exists to provide a nice-looking response at the top level "/" url
  @Get()
  index(): object {
    return this.getVersionResponse();
  }

  // This route handler only exists to provide a nice-looking response at the /api url
  @Get('api')
  api(): object {
    return this.getVersionResponse();
  }

  // This route handler only exists to provide a nice-looking response at the /api/v1 url
  @Get('api/v1')
  apiV1() {
    return this.getVersionResponse();
  }

  // Returns various server-side values that should be treated as constants on the client side
  @Get('api/v1/remote-constants')
  remoteConstants() {
    return {
      placeholderUrlNoImageAvailable: relativeToFullImagePath(this.configService, '/placeholders/no_image_available.png'),
    };
  }

  // Returns the detected IP address
  @Get('api/v1/ip-check')
  ipCheck(@IpOrForwardedIp() ip: string) {
    return {
      ip,
    };
  }

  // This route handler only exists to provide a 200 status and "ok" message as a health check endpoint
  @Get('health-check')
  healthCheck(): object {
    return {
      status: 'ok',
    };
  }

  getVersionResponse() {
    return {
      version: process.env.npm_package_version,
    };
  }
}
