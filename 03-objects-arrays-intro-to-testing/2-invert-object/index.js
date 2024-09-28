/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj == null) {
    return;
  }
  for (let value of Object.entries(obj)) {
    swapKeyAndValue(obj, value);
  }

  return obj;
}

function swapKeyAndValue(obj, pair) {
  Object.defineProperty(obj, pair[1], Object.getOwnPropertyDescriptor(obj, pair[0]));
  obj[pair[1]] = pair[0];
  delete obj[pair[0]];
}
