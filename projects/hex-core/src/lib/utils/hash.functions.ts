/**
 * JavaScript does not natively provide a hash function
 * @param target string to hash
 * @returns hash of the string
 */
export function hashCode(target: string): number {
  let hash = 0;
  for (let i = 0; i < target.length; i++) {
    const char = target.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Browser support the ES2015 standard of preserving order of fields in objects, but order is determined by insertion; if two objects have the same fields and the same value for those fields, and then
 * they are stringified and hashed, they will have different hashes. This function recursively reorders keys based on alphabetical order and hashes field values. Function will reorder array elements
 * based on their hash value.
 *
 * WARNING
 * Function does not currently work for two-dimensional arrays, and it may not work for fields that can be interpreted as a number because of browser differences
 *
 * @param obj object to standardize the keys for
 * @returns a hash representing the object that has been sorted
 */
export function hashObject(obj: object): number {
  const sortedObj = Object.keys(obj).sort().reduce(
    (sortedObj, key) => {
      if (Array.isArray(obj[key])) {
        sortedObj[key] = hashCode(
          JSON.stringify(
            obj[key]
              .map(element => typeof element === 'object' ? hashObject(element) : hashCode(`${element}`))
              .sort(),
          ),
        );
      } else if (obj[key] != null && typeof obj[key] === 'object') {
        sortedObj[key] = hashObject(obj[key]);
      } else {
        sortedObj[key] = hashCode(`${obj[key]}`);
      }

      return sortedObj;
    },
    {},
  );

  return hashCode(JSON.stringify(sortedObj));
}
