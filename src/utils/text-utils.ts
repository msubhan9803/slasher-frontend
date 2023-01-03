// Finds the first YouTube link in a post and returns the YouTube ID in the 6-index capture group
const YOUTUBE_LINK_REGEX = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?/;

export function findFirstYouTubeLinkVideoId(content: string) {
  return content.match(YOUTUBE_LINK_REGEX)?.[6];
}

export function replaceHtmlToText(content: string) {
  return content.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeScriptTags(content: string) {
  return content.replaceAll(/(<)([^>]*script[^>]*)(>)/gi, '&lt;$2&gt;');
}

export function decryptMessage(content: any) {
  const found = content ? content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '') : '';
  return found;
}
