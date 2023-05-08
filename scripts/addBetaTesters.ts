/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { createApp } from './createApp';
import { BetaTestersService } from '../src/beta-tester/providers/beta-testers.service';

async function addBetaTesters(app: INestApplication, entries: { email: string, name: string }[]) {
  const betaTestersService = app.get<BetaTestersService>(BetaTestersService);
  for (const entry of entries) {
    if (!(await betaTestersService.findByEmail(entry.email))) {
      console.log('Adding: ', entry);
      await betaTestersService.create(entry);
    } else {
      console.log('Skipping (email already exists): ', entry);
    }
  }
}

(async () => {
  if (process.argv.length <= 2) {
    console.log("Usage: ./addBetaTesters.ts 'email1@example.com,name1|email2@example.com,name2|email3@example.com,name3'");
    return;
  }
  console.log(process.argv.length);
  const input = process.argv[2];
  const entries = input.split('|').map((emailNameString) => {
    const indexOfComma = emailNameString.indexOf(',');
    const email = emailNameString.substring(0, indexOfComma);
    const name = emailNameString.substring(indexOfComma + 1);

    if (email.length === 0 || !isEmail(email)) {
      throw new Error(`Invalid email: ${email}`);
    }

    if (name.length === 0 || name.length > 50) {
      throw new Error(`Invalid name: ${name}`);
    }

    return { email, name };
  });

  const app = await createApp();
  await addBetaTesters(app, entries);
  app.close();
})();
