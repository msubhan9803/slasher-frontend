// Example path (array): ['[*]', 'images', '[*]', image_path']
// TODO: Add tests
export function simpleObjectPath(path: string[], obj: object, results = []): any[] {
  if (path.length === 0) {
    results.push(obj);
    return results;
  }

  const currentSelector = path.shift();
  const arrayMatchCheck = currentSelector.match(/\[(.+)\]/);
  if (arrayMatchCheck) {
    const element = arrayMatchCheck[1];
    if (obj instanceof Array) {
      if (element === '*') {
        for (const el of obj) {
          simpleObjectPath([...path], el, results);
        }
      } else {
        const index = parseInt(element, 10);
        if (index + 1 >= obj.length) { simpleObjectPath([...path], obj[element], results); }
      }
    }
    return results;
  }
  if (obj[currentSelector]) {
    simpleObjectPath([...path], obj[currentSelector], results);
  }

  return results;
}

export function convertSimpleJsonPathToObjectPath(path: string) {
  if (!path.match(/\$(\.[a-zA-Z-_]+|\[(\*|\d)\])*/)) {
    throw new Error(`Unsupported json path: ${path} (method only accepts simple paths like $[*].a, $.a.b.c, $.a[*].b[1])`);
  }
  if (path === '$') { return []; }
  return path.replace(/(\[[*\d]+\])/g, '.$1').replace('$.', '').split('.');
}

// Example path (string): '$[*].images[*].image_path'
// Note: This is a (limited) custom implementation of JSONPath because the popular json path
// libraries only support hasOwnProperty properties, and Mongoose objects use an inherited
// property that causes hasOwnProperty to return false.  See this StackOverflow answer for info:
// https://stackoverflow.com/questions/30923378/why-does-mongoose-models-hasownproperty-return-false-when-property-does-exist
// And see this GitHub issue, which is an unresolved issue for the (most popular) JSONPath-Plus library:
// https://github.com/JSONPath-Plus/JSONPath/issues/174
// It doesn't seem like this issue will be solved any time soon in the library, so that's why we
// have ourn own version here.
//
// TODO: Add tests
export function simpleJsonPath(path: string, obj: object, results = []): any[] {
  return simpleObjectPath(convertSimpleJsonPathToObjectPath(path), obj, results);
}
