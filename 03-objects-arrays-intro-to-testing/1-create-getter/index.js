/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split(".");
  
  return function rec(obj, i = 0) {
    if (Object.hasOwn(obj, pathArr[i]) && i === (pathArr.length - 1)) {
      return obj[pathArr[i]];
    } else if (!Object.hasOwn(obj, pathArr[i])) {
      return;
    }
      
    return rec(obj[pathArr[i++]], i);
  };
}
