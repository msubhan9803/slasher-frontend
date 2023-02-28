/* eslint-disable max-classes-per-file */

/* All of our custom error classes extend SlasherError in case we need to catch broad app errors. */

export class SlasherError extends Error {
  constructor(...args: any) {
    super(...args);
    this.name = this.constructor.name;
  }
}

export class WaitForTimeoutError extends SlasherError { }
export class NotFoundError extends SlasherError { }
export class InvalidPathError extends SlasherError { }
export class S3FileExistsError extends SlasherError { }
