import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CaptchaService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  async verifyReCaptchaToken(token: string): Promise<any> {
    try {
      // const result = await lastValueFrom(this.httpService.post<any>(`https://www.google.com/recaptcha/api/siteverify?
      // secret=${this.configService.get<string>('CAPTCHA_SECRET_KEY')}&response=${token}`));
      const result = await lastValueFrom(this.httpService.post<any>(
        `https://www.google.com/recaptcha/api/siteverify?secret=6LfC3L4mAAAAAEzfQvMv9Igj-mOs6oUYyJNkCIsX&response=${token}`,
));
      const data = result.data || {};
      return data;
    } catch (err) {
      return { success: false, error: 'Captcha validation failed. Please try again.' };
    }
  }
}
