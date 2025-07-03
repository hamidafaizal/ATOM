import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Kunci rahasia dan algoritma, diambil dari environment variables untuk keamanan
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a-32-byte-long-secret-key-1234'; // Harus 32 byte
const ALGORITHM = 'aes-256-cbc';

/**
 * Melakukan hash pada password menggunakan bcrypt.
 * @param {string} password - Password teks biasa.
 * @returns {Promise<string>} - Hash dari password.
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Membandingkan password teks biasa dengan hash yang ada di database.
 * @param {string} password - Password yang dimasukkan pengguna.
 * @param {string} hashedPassword - Hash yang tersimpan di database.
 * @returns {Promise<boolean>} - True jika cocok, false jika tidak.
 */
export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Mengenkripsi sebuah teks (digunakan untuk bot token).
 * @param {string} text - Teks yang akan dienkripsi.
 * @returns {{iv: string, encryptedData: string}} - IV dan data terenkripsi.
 */
export const encryptToken = (text) => {
  const iv = crypto.randomBytes(16); // Membuat Initialization Vector baru setiap kali enkripsi
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

/**
 * Mendekripsi teks (digunakan untuk bot token).
 * @param {string} encryptedData - Data yang sudah dienkripsi.
 * @param {string} ivHex - IV yang digunakan saat enkripsi, dalam format hex.
 * @returns {string} - Teks asli yang sudah didekripsi.
 */
export const decryptToken = (encryptedData, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

/**
 * Membuat JSON Web Token (JWT) untuk sesi login pengguna.
 * @param {object} payload - Data yang ingin disimpan di dalam token (misal: userId, email).
 * @returns {string} - JWT yang sudah ditandatangani.
 */
export const generateJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Token berlaku selama 7 hari
};

/**
 * Memverifikasi JWT.
 * @param {string} token - JWT dari header request.
 * @returns {object | null} - Payload dari token jika valid, atau null jika tidak.
 */
export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
