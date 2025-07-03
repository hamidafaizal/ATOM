/**
 * Menghasilkan token numerik acak dengan panjang tertentu.
 * @param {number} length - Panjang token yang diinginkan.
 * @returns {string} - Token numerik dalam bentuk string.
 */
export const generateNumericToken = (length = 6) => {
  return Math.random().toString().substring(2, 2 + length).padEnd(length, '0');
};
