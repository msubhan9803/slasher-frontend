export const SIMPLE_MONGODB_ID_REGEX = /^[a-f\d]{24}$/i;
export const SIMPLE_ISO_8601_REGEX = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
export const UUID_V4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
export const MAXIMUM_IMAGE_UPLOAD_SIZE = 10 * 1_000_000; // 10 MB
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
