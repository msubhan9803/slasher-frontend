import { SLASHER_AMAZON_TAG_ID } from '../constants';
import { FormatMentionProps } from '../types';

// Finds the first YouTube link in a post and returns the YouTube ID in the 6-index capture group
const YOUTUBE_LINK_REGEX = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?/;

/* eslint-disable no-useless-escape */
const EMOJI_REGEX = /((\ud83c[\udde6-\uddff]){2}|([\#\*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)((?![“”]))(?![^<>]*>)/g;

export function findFirstYouTubeLinkVideoId(message: string) {
  return message?.match(YOUTUBE_LINK_REGEX)?.[6];
}

export function escapeHtmlSpecialCharacters(
  str: string,
  selectedHashtag?: string,
  hashtags?: string[],
) {
  const hashtagRegex = /#([\w-]+)/g;

  let result = str?.replaceAll('&', '&amp;')
    ?.replaceAll('<', '&lt;')
    ?.replaceAll('>', '&gt;')
    ?.replaceAll('"', '&quot;')
    ?.replaceAll("'", '&#039;');
  if (selectedHashtag && hashtags) {
    result = result.replace(hashtagRegex, (match) => {
      const hashtag = match.slice(1).toLowerCase();
      return hashtags.includes(hashtag)
        ? `<a href="/app/search/posts?hashtag=${hashtag}" style="text-decoration: underline; font-weight:${selectedHashtag === match && '700'}">${match}</a>`
        : match;
    });
  }
  return result;
}

/**
 * For the given string, replaces all new line characters with '<br />'.
 * @param htmlString
 * @returns
 */
export function newLineToBr(str: string) {
  return str?.replaceAll('\n', '<br />');
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

function isEmoji(text: string) {
  const emojiPattern = /(?:[\u203C-\u3299\u203C-\u303D\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u21AA\u231A-\u231B\u2328\u2388\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u28FF\u2934-\u29FF\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C\uDC04|\uD83C\uDCCF|\uD83C\uDDE6-\uD83C\uDDFF|\uD83C\uDE01|\uD83C\uDE02|\uD83C\uDE1A-\uD83C\uDE2F|\uD83C\uDE32-\uD83C\uDE3A|\uD83C\uDE50|\uD83C\uDE51|\uD83C\uDF00-\uD83C\uDF21|\uD83C\uDF23-\uD83C\uDF2F|\uD83C\uDF33-\uD83C\uDF3A|\uD83C\uDF40|\uD83C\uDF41|\uD83C\uDF43-\uD83C\uDF45|\uD83C\uDF47-\uD83C\uDF4C|\uD83C\uDF4E-\uD83C\uDF50|\uD83C\uDF52-\uD83C\uDF67|\uD83C\uDF69-\uD83C\uDF6C|\uD83C\uDF70|\uD83C\uDF85-\uD83C\uDF87|\uD83C\uDFE0-\uD83C\uDFE6|\uD83C\uDFE8-\uD83C\uDFED|\uD83C\uDFF0|\uD83C\uDFF7|\uD83C\uDFF8|\uD83C\uDFF9|\uD83C\uDFFB-\uD83C\uDFFF|\uD83D\uDC00-\uD83D\uDC7F|\uD83D\uDC80-\uD83D\uDCFF|\uD83D\uDE00-\uD83D\uDE4F|\uD83D\uDE80-\uD83D\uDEFF|\uD83E\uDD10-\uD83E\uDD3A|\uD83E\uDD3C-\uD83E\uDD3E|\uD83E\uDD40-\uD83E\uDD45|\uD83E\uDD47-\uD83E\uDD4C|\uD83E\uDD50|\uD83E\uDD52-\uD83E\uDD67|\uD83E\uDD6F-\uD83E\uDD73|\uD83E\uDD76|\uD83E\uDD7A|\uD83E\uDD7E-\uD83E\uDD81|\uD83E\uDD84-\uD83E\uDD85|\uD83E\uDD87-\uD83E\uDD89|\uD83E\uDD8C-\uD83E\uDD91|\uD83E\uDD93-\uD83E\uDD94|\uD83E\uDD96|\uD83E\uDD97|\uD83E\uDD99-\uD83E\uDD9A|\uD83E\uDD9C-\uD83E\uDD9E|\uD83E\uDDA0-\uD83E\uDDA2|\uD83E\uDDA5-\uD83E\uDDA7|\uD83E\uDDA9-\uD83E\uDDAC|\uD83E\uDDAE-\uD83E\uDDD0|\uD83E\uDDD2-\uD83E\uDDD3|\uD83E\uDDD5\uD83E\uDDD7\uD83E\uDDDC-\uD83E\uDDDE\uD83E\uDDE0-\uD83E\uDDE5\uD83E\uDDE7-\uD83E\uDDFF]+|[\uD800-\uD83F][\uDC00-\uDFFF]|\uD83F[\uDC00-\uDEFF])/g;
  return emojiPattern.test(text);
}
export function decryptMessage(message: string, isReplaced?: boolean, isEditModal?: boolean) {
  const replacedContent = isReplaced
    ? message
    : message.replace(EMOJI_REGEX, (match: string) => {
      if (isEmoji(match)) {
        return `<span style="font-size: 1.375rem;">${match}</span>`;
      }
      return match;
    });
  const found = message ? replacedContent.replace(
    /##LINK_ID##(\w+)@([a-zA-Z0-9_.-]+)##LINK_END##/g,
    (match, fullMention, mention) => `${isEditModal ? `@${mention}` : `<a href="/${mention}/about">@${mention}</a>`}`,
  ) : '';
  return found;
}

export function replyMentionFormat(msg: any, id: any) {
  const encryptMention = `##LINK_ID##${id}${msg}##LINK_END##`;
  return encryptMention;
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

export const generateAmazonAffiliateLinkForBook = (title: string, author: string) => {
  const newTitle = title.split(' ').join('+');
  const newAuthor = author.split(' ').join('+');
  const searchText = `${newTitle}+${newAuthor}`;
  return `https://www.amazon.com/s/ref=nosim?k=${searchText}&i=stripbooks-intl-ship&tag=${SLASHER_AMAZON_TAG_ID}`;
};

export const getCoverImageForBook = (imageId: number): string | undefined => {
  if (imageId) {
    return `https://covers.openlibrary.org/b/ID/${imageId}-L.jpg`;
  }
  return undefined;
};

export const getPrefferedISBN = (isbnNumber: string[]) => {
  const isbn10 = isbnNumber.find((isbn) => isbn.length === 10);
  if (isbn10) { return isbn10; } // we should prefer ISBN10 over ISBN13

  const isbn13 = isbnNumber.find((isbn) => isbn.length === 13);
  return isbn13;
};
