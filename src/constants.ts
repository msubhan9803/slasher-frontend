export const SIMPLE_MONGODB_ID_REGEX = /^[a-f\d]{24}$/i;
export const MAXIMUM_IMAGE_UPLOAD_SIZE = 10 * 1_000_000; // 10 MB
export const FRIEND_RELATION_ID = '5c9cb7138a874f1dcd0d8dcc';

export const SHARED_GATEWAY_OPTS = {
  cors: {
    origin: '*',
  },
  // Even though '/socket.io/' is the default path value for socket.io, we'll be explicit about it here.
  path: '/socket.io/',
  // we only want to support websocket connections (not interested in long polling at this time).
  transports: ['websocket'],
};
