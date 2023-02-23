/* eslint-disable class-methods-use-this */
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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
