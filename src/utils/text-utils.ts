// TODO: Add a test for this function
export function extractUserMentionIdsFromMessage(text: string) {
  if (!text) { return []; }
  const matches = text.match(/[a-fA-F0-9]{24}@[a-zA-Z0-9_.-]+/g);
  const userMentionIds = matches?.map((collectedUserData) => collectedUserData.split('@')[0]) || [];
  // Return deduplicated list
  return [...new Set(userMentionIds)];
}

export function escapeHtmlSpecialCharacters(str: string) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Returns extension of a filename.
 * For e.g., https://covers.openlibrary.org/b/ID/2808629-L.jpg
 * we get extension as `jpg`
 */
export function getExtensionFromFilename(filename: string) {
  const arr = filename.split('.');
  return arr[arr.length - 1];
}

export const getCoverImageForBookOfOpenLibrary = (imageId: number): string | undefined => {
  if (imageId) {
    return `https://covers.openlibrary.org/b/ID/${imageId}-L.jpg`;
  }
  return undefined;
};
