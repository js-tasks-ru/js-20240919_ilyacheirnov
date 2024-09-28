/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string === '' || size === 0) {
    return '';
  }
  if (size === undefined) {
    return string;
  }

  let result = new Array();
  let count = 0;
  let ch = '';

  for (let char of string) {
    if (ch !== char) {
      ch = char;
      result += char;
      count = 1;
    } else {
      if (count === size) {
        continue;
      } else {
        result += char;
        ++count;
      }
    }
  }

  return result;
}
