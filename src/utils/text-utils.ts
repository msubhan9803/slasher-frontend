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
