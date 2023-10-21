/**
 * Why use `jestLogger` in tests instead of regular console.log in our tests file?
 * > Because the default version of console.log in tests environment is manipulated by Jest
 * environment so that each log prints the line and filename of the log. This ends up in
 * lot of verbosity and thus hinders the debugging experience to some users.
 * Usage:
 * In any test file, use below code on top of file:

  import { jestLogger } from '../../utils/logger-utils';
  console.log = jestLogger;

  Note: We don't want to directly use `jestLogger` because we do not
  get eslint waring of no-console-log.
  So, we should override console.log so that we get eslint warnings and
  we don't end up getting log statements in our tests.

*/

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
export const jestLogger = require('console').log;
