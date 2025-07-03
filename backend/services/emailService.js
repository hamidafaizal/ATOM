import nodemailer from 'nodemailer';

// Konfigurasi transporter (pengirim email) diambil dari environment variables.
// Ini memungkinkan Anda menggunakan penyedia email apa pun (Gmail, SendGrid, dll.)
// tanpa mengubah kode, cukup ubah file .env di server Anda.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Contoh: 'smtp.gmail.com'
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: (process.env.EMAIL_PORT === '465'), // true untuk port 465, false untuk port lain
  auth: {
    user: process.env.EMAIL_USER, // Alamat email Anda
    pass: process.env.EMAIL_PASS, // Password email atau password aplikasi
  },
});

/**
 * Mengirim email verifikasi yang berisi kode 6 digit.
 * @param {string} to - Alamat email tujuan.
 * @param {string} token - Kode verifikasi 6 digit.
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (to, token) => {
  const mailOptions = {
    from: `"ATOM Gaji" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Kode Verifikasi untuk Akun ATOM Anda',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Selamat Datang di ATOM!</h2>
        <p>Terima kasih telah mendaftar. Gunakan kode berikut untuk memverifikasi alamat email Anda:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 10px; background-color: #f2f2f2; text-align: center;">
          ${token}
        </p>
        <p>Kode ini akan kedaluwarsa dalam 10 menit.</p>
        <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
        <hr/>
        <p style="font-size: 0.8em; color: #777;">Email ini dikirim secara otomatis. Mohon untuk tidak membalas.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verifikasi terkirim ke: ${to}`);
  } catch (error) {
    console.error(`Gagal mengirim email ke ${to}:`, error);
    // Di aplikasi nyata, Anda mungkin ingin menambahkan penanganan error yang lebih baik,
    // misalnya mencoba mengirim ulang atau memberi tahu admin.
    throw new Error('Gagal mengirim email verifikasi.');
  }
};
