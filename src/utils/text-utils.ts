import { FormatMentionProps } from '../types';

// Finds the first YouTube link in a post and returns the YouTube ID in the 6-index capture group
const YOUTUBE_LINK_REGEX = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?/;

export function findFirstYouTubeLinkVideoId(message: string) {
  return message?.match(YOUTUBE_LINK_REGEX)?.[6];
}

export function escapeHtmlSpecialCharacters(str: string) {
  return str.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * For the given string, replaces all new line characters with '<br />'.
 * @param htmlString
 * @returns
 */
export function newLineToBr(str: string) {
  return str.replaceAll('\n', '<br />');
}

/**
 * For the given html, removes all script tags and also removes all
 * html attribures other than <img> "src" and <a> "href".
 * @param htmlString
 * @returns
 */
export function cleanExternalHtmlContent(htmlString: string) {
  const containerElement = document.createElement('div');
  containerElement.innerHTML = htmlString;

  // Remove all script tags
  // eslint-disable-next-line no-restricted-syntax
  for (const el of Array.from(containerElement.querySelectorAll('script'))) {
    el.remove();
  }

  // Remove all attributes, with certain exceptions
  // eslint-disable-next-line no-restricted-syntax
  for (const el of Array.from(containerElement.querySelectorAll('*'))) {
    // For each element, iterate over and remove all attributes
    // Remove them in reverse order so that their indexes aren't affected as we delete
    let attributeNamesToDelete = Array.from(el.attributes).map((attr: any) => attr.name);

    const lowerCaseTagName = el.tagName.toLocaleLowerCase();

    // If this is an <img> element, keep the src attribute
    // If this is an <a> element, keep the href attribute
    attributeNamesToDelete = attributeNamesToDelete.filter((attributeName: any) => {
      const lowerCaseAttributeName = attributeName.toLocaleLowerCase();
      if (lowerCaseTagName.toLocaleLowerCase() === 'a' && lowerCaseAttributeName === 'href') { return false; }
      if (lowerCaseTagName === 'img' && lowerCaseAttributeName === 'src') { return false; }
      return true;
    });

    // Delete all attributes other than 'href', so we can still support links
    // eslint-disable-next-line no-restricted-syntax
    attributeNamesToDelete.forEach((attributeName: string) => {
      el.removeAttribute(attributeName);
    });

    // Add classes to img tags to style them
    if (lowerCaseTagName === 'img') {
      // el.setAttribute('class', 'w-100');
      el.setAttribute('style', 'max-height: 400px; max-width: 100%; object-fit: contain; display: block; margin: 1rem auto;');
    }
  }

  return containerElement.innerHTML;
}

export function decryptMessage(message: any) {
  const found = message ? message.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '') : '';
  return found;
}

export function sortInPlace(array: string[]) {
  return array.sort((a, b) => a.localeCompare(b));
}

// For tests of below regex refer - file://./regex-tests.ts (TIP: Use Ctrl+click to browse the file in vscode)
export const atMentionsGlobalRegex = /(\s|^)@[a-zA-Z0-9_.-]+/g;

/**
 * This function return all white space characters in the beginning of the input text.
 * @param text This is any text with or without space, tab or new line characters in front of
 * the text. Example - 'cat', ' cat', '    cat', '  <newLineCharacter>  cat'
 * @returns All white space characters in the beginning of the input text
 */
export const getLeadingWhiteSpace = (text: string) => text.match(/\s.+/)?.[0]?.replace(text.trimStart(), '');

export const generateMentionReplacementMatchFunc = (
  formatMention: FormatMentionProps[],
) => {
  function mentionReplacementMatchFunc(match: string) {
    const leadingWhiteCharacters = getLeadingWhiteSpace(match);
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      if (finalString) {
        return `${leadingWhiteCharacters || ''}${finalString.format}` as any;
      }
      return match;
    }
    return undefined;
  }

  return mentionReplacementMatchFunc;
};
