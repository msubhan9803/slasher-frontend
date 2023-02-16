import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

// We are using `VERSION_NEUTRAL` to makes it accessible over `/api` path i.e., without any api version.
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  // eslint-disable-next-line class-methods-use-this
  @Get()
  index(): object {
    return {
      version: process.env.npm_package_version,
    };
  }
}
