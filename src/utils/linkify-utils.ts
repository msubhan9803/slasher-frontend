type LinkifyOpts = import('linkifyjs').Opts;

export const customlinkifyOpts: LinkifyOpts = {
  // DOCS: https://linkify.js.org/docs/options.html#target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  target: (value: string, type: string, token) => ((value.includes('slasher.tv') || value.includes('localhost')) ? '_parent' : '_blank'),
};
