import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(): object {
    return {
      appVersion: process.env.npm_package_version,
    };
  }
}
