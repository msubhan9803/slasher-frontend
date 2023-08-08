export const SIMPLE_MONGODB_ID_REGEX = /^[a-f\d]{24}$/i;
export const SIMPLE_ISO_8601_REGEX = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
export const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
export const MAXIMUM_IMAGE_UPLOAD_SIZE = 15.36 * 1_000_000; // 10 MB
export const UPLOAD_PARAM_NAME_FOR_FILES = 'files';
export const UPLOAD_PARAM_NAME_FOR_IMAGES = 'images';
export const MAX_ALLOWED_UPLOAD_FILES_FOR_POST = 10;
export const MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT = 10;
export const MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT = 4;
export const MAX_ALLOWED_UPLOAD_FILES_FOR_EVENT = 4;
export const FRIEND_RELATION_ID = '5c9cb7138a874f1dcd0d8dcc';
export const UNREAD_MESSAGE_NOTIFICATION_DELAY = 3_000;
export const NON_ALPHANUMERIC_REGEX = /^[!-/:-@[-`{-~]/;
export const DEFAULT_REQUEST_TIMEOUT = 130; // a default value that can be overridden via env config
export const WELCOME_MSG = `Welcome to Slasher! 🔪🔪🔪 It's nice to have you with us!

Here's some helpful info I share with everyone new. Hopefully you find it useful and it helps you enjoy your time with us!

If you have something to promote, that's cool!
You're absolutely welcome to do that on the feed or in the relevant groups.
*** Please don't promote in messages (see rules below) ***. 💯

You can learn about the features here: https://pages.slasher.tv/help

IMPORTANT: for the few rules we have: https://pages.slasher.tv/rules - please be sure to read them.

TIP: the more friends you add, the more stuff you'll see on your feed and the more people there are to see yours.

BONUS TIP: explore all the areas of Slasher - you may find some cool features!

Popular features include: * Movies * Events * News *

If you have any questions or suggestions to improve Slasher, I'm here to help and love feedback! 🤘😊

Enjoy!

P.S. - If you love Slasher, here’s a 15% discount code you can use to get some cool stuff in our shop!
Code: welcome15
Shop: https://pages.slasher.tv/shop/`;

export const SHARED_GATEWAY_OPTS = {
  cors: {
    origin: '*',
  },
  // Even though '/socket.io/' is the default path value for socket.io, we'll be explicit about it here.
  path: '/socket.io/',
  // we only want to support websocket connections (not interested in long polling at this time).
  transports: ['websocket'],
};

export const METERS_TO_MILES_MULTIPLIER = 0.000621371;
