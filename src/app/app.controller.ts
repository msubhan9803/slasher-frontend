import { Controller, Get } from '@nestjs/common';

@Controller({ version: ['1'] })
export class AppController {
  // eslint-disable-next-line class-methods-use-this
  @Get()
  index(): object {
    return {
      version: process.env.npm_package_version,
    };
  }
}
