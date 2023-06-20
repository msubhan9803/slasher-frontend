import { Global, Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule { }
