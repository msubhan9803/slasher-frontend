import { convertSimpleJsonPathToObjectPath } from './simple-path-utils';

describe('simple-path-utils', () => {
  describe('convertSimpleJsonPathToObjectPath', () => {
    const jsonPathsToObjectPaths = {
      '$[*].images[*].image_path': ['[*]', 'images', '[*]', 'image_path'],
      '$.profilePic': ['profilePic'],
      '$.images[*]': ['images', '[*]'],
      $: [],
    };

    Object.entries(jsonPathsToObjectPaths).forEach(([jsonPath, objectPath]) => {
      it(`converts as expected for ${jsonPath}`, () => {
        expect(convertSimpleJsonPathToObjectPath(jsonPath)).toEqual(objectPath);
      });
    });

    it('throws an Error for a unsupported paths', () => {
      expect(() => { convertSimpleJsonPathToObjectPath('not-valid'); }).toThrow();
    });
  });
});
