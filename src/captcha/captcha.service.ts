import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs'
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class CaptchaService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  async verifyHCaptchaToken(token: string): Promise<any> {

    try {
      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      const params = {
        'response': token,
        'secret': `${this.configService.get<string>('HCAPTCHA_SECRET_KEY')}`
      }
      let result = await lastValueFrom(this.httpService.post<any>(`https://hcaptcha.com/siteverify`, qs.stringify(params), { headers }))
      let data = result.data || {};
      return data
    } catch (err) {
      return { success: false, error: 'Captcha validation failed. Please try again.' }
    }
  }
}
