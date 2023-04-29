/* eslint-disable class-methods-use-this */
import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { relativeToFullImagePath } from '../utils/image-utils';
import { IpOrForwardedIp } from './decorators/ip-or-forwarded-ip.decorator';
import { sleep } from '../utils/timer-utils';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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

  @Get('api/v1/sleep-test')
  async sleepTest() {
    await sleep(70_000);
    return this.getVersionResponse();
  }

  @Get('api/v1/cpu-test')
  async cpuTest() {
    const randomInt = Math.floor(Math.random() * 1_000_000);
    this.logger.debug(`START /api/v1/cpu-test begin (random value: ${randomInt})`);
    this.fibonacci(41); // Temporarily do an expensive computation (for testing)
    this.logger.debug(`END /api/v1/cpu-test begin (random value: ${randomInt})`);
    return this.getVersionResponse();
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

  fibonacci(num) {
    if (num <= 1) { return num; }
    return this.fibonacci(num - 1) + this.fibonacci(num - 2);
  }
}
