import { registerPlugin, test } from 'linkifyjs';
import mention from './linkify-mention-plugin';

registerPlugin('mention', mention);
test('@avadh._77', 'mention');

type LinkifyOpts = import('linkifyjs').Opts;

const sharedLinkifyOpts: LinkifyOpts = {
  // DOCS: https://linkify.js.org/docs/options.html#target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  target: (value: string, type: string, token) => {
    if (value.startsWith('/') || value.includes('slasher.tv') || value.includes('localhost')) {
      return '_parent';
    }
    return '_blank';
  },
  validate: {
    mention: false,
  },
};

export const defaultLinkifyOpts: LinkifyOpts = { ...sharedLinkifyOpts };

export const ignoreUsernamesLinkifyOpts: LinkifyOpts = {
  ...sharedLinkifyOpts,
  validate: {
    mention: false,
  },
};
