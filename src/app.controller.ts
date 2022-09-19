import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // eslint-disable-next-line class-methods-use-this
  @Get()
  index(): object {
    return {
      appVersion: process.env.npm_package_version,
    };
  }
}
