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

