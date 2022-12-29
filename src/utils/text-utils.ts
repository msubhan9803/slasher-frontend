// TODO: Add a test for this function
export function extractUserMentionIdsFromMessage(text: string) {
  if (!text) { return []; }
  const matches = text.match(/[a-fA-F0-9]{24}@[a-zA-Z0-9_.-]+/g);
  return matches?.map((collectedUserData) => collectedUserData.split('@')[0]) || [];
}
