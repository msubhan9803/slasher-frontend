type LinkifyOpts = import('linkifyjs').Opts;

const sharedLinkifyOpts: LinkifyOpts = {
  // DOCS: https://linkify.js.org/docs/options.html#target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  target: (value: string, type: string, token) => ((value.includes('slasher.tv') || value.includes('localhost')) ? '_parent' : '_blank'),
};

export const defaultLinkifyOpts: LinkifyOpts = { ...sharedLinkifyOpts };

export const ignoreUsernamesLinkifyOpts: LinkifyOpts = {
  ...sharedLinkifyOpts,
  validate: {
    mention: false,
  },
};
