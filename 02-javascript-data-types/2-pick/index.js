/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  let result = {};
  let arr = Object.entries(obj);
  
  for (let i = 0; i < arr.length; ++i) {
    let [key, value] = arr[i];
    
    for (let j = 0; j < fields.length; ++j) {
      if (fields[j] === key) {
        result[key] = value;
      }
    }
  }
  
  return result;
};
