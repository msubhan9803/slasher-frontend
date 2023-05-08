/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common';
import { createApp } from './createApp';
import { DisallowedUsernameService } from '../src/disallowedUsername/providers/disallowed-username.service';

async function addDisallowedUsernames(app: INestApplication, entries: { username: string, notifyIfUsernameContains: boolean }[]) {
  const disallowedUsernameService = app.get<DisallowedUsernameService>(DisallowedUsernameService);
  for (const entry of entries) {
    if (!(await disallowedUsernameService.findUserName(entry.username))) {
      console.log('Adding: ', entry);
      await disallowedUsernameService.create({ username: entry.username, notifyIfUsernameContains: entry.notifyIfUsernameContains });
    } else {
      console.log('Skipping (username already exists):', entry);
    }
  }
}

(async () => {
  if (process.argv.length <= 2) {
    console.log("Usage: ./addDisallowedUsernames.ts 'value1,true|value2,true|value3,true'");
    return;
  }
  const input = process.argv[2];
  const entries = input.split('|').map((emailNameString) => {
    const indexOfComma = emailNameString.indexOf(',');
    const username = emailNameString.substring(0, indexOfComma);
    const notifyIfUsernameContains = emailNameString.substring(indexOfComma + 1);

    const entry = { username, notifyIfUsernameContains: notifyIfUsernameContains === 'true' };

    if (username.length === 0) {
      throw new Error(`Invalid entry: ${entry}`);
    }

    if (notifyIfUsernameContains.length === 0 || (notifyIfUsernameContains !== 'true' && notifyIfUsernameContains !== 'false')) {
      throw new Error(`Invalid entry: ${entry}`);
    }

    return entry;
  });

  const app = await createApp();
  await addDisallowedUsernames(app, entries);
  app.close();
})();
