/* eslint-disable max-len */
import { atMentionsGlobalRegex } from './text-utils';

describe('@ mentions regex', () => {
  const regex = atMentionsGlobalRegex;
  test('1 - Should match valid usernames starting with @', () => {
    const text = 'Hello, @JohnDoe! How are you, @Jane.Doe?';
    const matches = text.match(regex);
    // NOTE: The leading whitespace should be handled explicity using function `getLeadingWhiteCharacters`
    expect(matches).toEqual([' @JohnDoe', ' @Jane.Doe']);
  });

  test('2 - Should match valid usernames starting with @ in start of line', () => {
    const text = '@JohnDoe! How are you, @Jane.Doe?';
    const matches = text.match(regex);
    // NOTE: The leading whitespace should be handled explicity using function `getLeadingWhiteCharacters`
    expect(matches).toEqual(['@JohnDoe', ' @Jane.Doe']);
  });

  test('3 - Should NOT match usernames within words', () => {
    const text = 'This is an email: john.doe@example.com';
    const matches = text.match(regex);
    expect(matches).toBeNull();
  });

  test('4 - Should NOT match usernames preceded by non-whitespace characters in the start of the line', () => {
    const text = 'Mentioning@someone should not be matched.';
    const matches = text.match(regex);
    expect(matches).toBeNull();
  });

  test('5 - Should match usernames with uppercase and lowercase letters', () => {
    const text = 'Hello, @JohnDoe and @jane_doe!';
    const matches = text.match(regex);
    // NOTE: The leading whitespace should be handled explicity using function `getLeadingWhiteCharacters`
    expect(matches).toEqual([' @JohnDoe', ' @jane_doe']);
  });

  test('6 - Should match usernames with digits and special characters', () => {
    const text = 'You can find me on Twitter: @user_1234!';
    const matches = text.match(regex);
    // NOTE: The leading whitespace should be handled explicity using function `getLeadingWhiteCharacters`
    expect(matches).toEqual([' @user_1234']);
  });

  test('7 - Should NOT match usernames without the @ symbol', () => {
    const text = 'This sentence mentions a user, not a username.';
    const matches = text.match(regex);
    expect(matches).toBeNull();
  });

  test('8 - Should match usernames with consecutive dots', () => {
    const text = 'My username is @user..name';
    const matches = text.match(regex);
    // NOTE: The leading whitespace should be handled explicity using function `getLeadingWhiteCharacters`
    expect(matches).toEqual([' @user..name']);
  });
});
