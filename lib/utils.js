/* Finds the intersection of two arrays.
 *
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} a ^ b
 *
 */
module.exports.intersect = function (a, b) {
  return a.filter(function (n) {
    return b.indexOf(n) !== -1;
  });
};

/**
 * Merges all values from object _b_ to _a_.
 *
 * @param  {object} a
 * @param  {object} b
 * @return {object}
 * @api public
 */
module.exports.merge = function (a, b) {
  if (!b) {
    return a;
  }
  var keys = Object.keys(b),
      i = 0,
      len = keys.length;

  for (; i < len; i += 1) {
    a[keys[i]] = b[keys[i]];
  }

  return a;
};
