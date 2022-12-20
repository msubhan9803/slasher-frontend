/* eslint-disable import/prefer-default-export */
// Finds the first YouTube link in a post and returns the YouTube ID in the 6-index capture group
const YOUTUBE_LINK_REGEX = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?/;

export function findFirstYouTubeLinkVideoId(content: string) {
  return content.match(YOUTUBE_LINK_REGEX)?.[6];
}
