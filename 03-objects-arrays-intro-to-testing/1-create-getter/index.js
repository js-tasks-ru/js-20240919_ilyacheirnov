/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split(".");
  let i = 0;

  return function rec(obj) {
    if (Object.hasOwn(obj, pathArr[i]) && i === (pathArr.length - 1)) {
      i = 0;
      return obj[pathArr[pathArr.length - 1]];
    } else if (!Object.hasOwn(obj, pathArr[i])) {
      i = 0;
      return;
    }

    return rec(obj[pathArr[i++]]);
  };
}
