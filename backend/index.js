import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// --- KONFIGURASI ---
const app = express();
const prisma = new PrismaClient();
const port = 3001;
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = 'https://d862-140-213-187-186.ngrok-free.app'; // <-- GANTI JIKA BERUBAH

// --- LOKASI KANTOR (PENTING: Ganti dengan koordinat Anda) ---
const OFFICE_COORDINATES = {
  latitude: -7.876258,  // Contoh: Latitude Mataram
  longitude: 111.480758, // Contoh: Longitude Mataram
};
const MAX_DISTANCE_METERS = 100; // Radius toleransi absensi (dalam meter)

// --- Inisialisasi Bot & Webhook ---
const bot = new TelegramBot(token);
bot.setWebHook(`${webhookUrl}/telegram/webhook`);
app.use(express.json());
app.post('/telegram/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// --- STATE SEMENTARA (Untuk menyimpan pilihan user 'MASUK' atau 'KELUAR') ---
// NOTE: Ini adalah state sederhana di memori. Untuk aplikasi produksi, disarankan menggunakan cache seperti Redis.
const userActionState = {};

// --- FUNGSI BANTU: Menghitung jarak antara dua koordinat (Haversine formula) ---
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Jari-jari bumi dalam meter
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
}

// --- HANDLER: Perintah /registrasi ---
bot.onText(/\/registrasi (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const namaLengkap = match[1];

  try {
    const karyawanExist = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
    if (karyawanExist) {
      bot.sendMessage(chatId, '❌ Anda sudah terdaftar sebelumnya.');
      return;
    }
    const karyawanBaru = await prisma.karyawan.create({ data: { telegram_id: BigInt(telegramId), nama_lengkap: namaLengkap } });
    bot.sendMessage(chatId, `✅ Registrasi berhasil! Selamat datang, ${karyawanBaru.nama_lengkap}.`);
  } catch (error) {
    console.error('Gagal registrasi:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat registrasi.');
  }
});

// --- HANDLER BARU: Perintah /absen ---
bot.onText(/\/absen/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  // Cek dulu apakah user sudah terdaftar
  const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
  if (!karyawan) {
    bot.sendMessage(chatId, '❌ Anda belum terdaftar. Silakan ketik `/registrasi Nama Lengkap Anda` terlebih dahulu.');
    return;
  }

  // Jika terdaftar, tampilkan tombol pilihan
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '➡️ Absen Masuk', callback_data: 'absen_masuk' },
          { text: '⬅️ Absen Keluar', callback_data: 'absen_keluar' },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, 'Silakan pilih jenis absensi:', options);
});

// --- HANDLER BARU: Menangani pilihan tombol (Callback Query) ---
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const telegramId = callbackQuery.from.id;
  const action = callbackQuery.data; // 'absen_masuk' atau 'absen_keluar'

  // Simpan pilihan user
  userActionState[telegramId] = action === 'absen_masuk' ? 'MASUK' : 'KELUAR';

  // Minta lokasi kepada user
  const options = {
    reply_markup: {
      keyboard: [
        [{ text: '📍 Bagikan Lokasi Saat Ini', request_location: true }],
      ],
      one_time_keyboard: true, // Keyboard hilang setelah dipakai
    },
  };
  bot.sendMessage(chatId, `Anda memilih Absen ${userActionState[telegramId]}. Sekarang, silakan bagikan lokasi Anda.`, options);
});

// --- HANDLER BARU: Menangani kiriman lokasi dari user ---
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const { latitude, longitude } = msg.location;

  // 1. Ambil aksi terakhir user dari state
  const tipeAbsen = userActionState[telegramId];
  if (!tipeAbsen) {
    bot.sendMessage(chatId, 'Silakan mulai dengan perintah /absen terlebih dahulu.');
    return;
  }

  try {
    // 2. Cek apakah user terdaftar
    const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
    if (!karyawan) {
      bot.sendMessage(chatId, '❌ Anda belum terdaftar.');
      return;
    }

    // 3. Hitung jarak dari kantor
    const distance = getDistance(latitude, longitude, OFFICE_COORDINATES.latitude, OFFICE_COORDINATES.longitude);

    // 4. Validasi jarak
    if (distance > MAX_DISTANCE_METERS) {
      bot.sendMessage(chatId, `❌ Gagal! Jarak Anda dari kantor adalah ${Math.round(distance)} meter. Anda berada di luar radius ${MAX_DISTANCE_METERS} meter.`);
      return;
    }

    // 5. Jika valid, simpan ke database
    await prisma.absensi.create({
      data: {
        tipe: tipeAbsen,
        latitude: latitude,
        longitude: longitude,
        karyawanId: karyawan.id, // Hubungkan ke ID karyawan
      },
    });

    bot.sendMessage(chatId, `✅ Absen ${tipeAbsen} berhasil pada pukul ${new Date().toLocaleTimeString('id-ID')}. Jarak Anda ${Math.round(distance)} meter dari kantor.`);
    console.log(`Absensi berhasil: ${karyawan.nama_lengkap} - ${tipeAbsen}`);

  } catch (error) {
    console.error('Gagal proses lokasi:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses lokasi Anda.');
  } finally {
    // Hapus state setelah selesai
    delete userActionState[telegramId];
  }
});

// --- Listener untuk pesan yang tidak dikenali ---
bot.on('message', (msg) => {
  // Cek jika pesan bukan perintah, bukan lokasi, agar tidak ada balasan ganda
  if (!msg.text || (!msg.text.startsWith('/registrasi') && !msg.text.startsWith('/absen'))) {
    if (msg.location) return; // Abaikan jika ini pesan lokasi
    bot.sendMessage(msg.chat.id, 'Perintah tidak dikenali. Gunakan `/registrasi` atau `/absen`.');
  }
});

// --- Menjalankan Server ---
app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
  console.log(`Webhook Telegram diatur ke ${webhookUrl}/telegram/webhook`);
});
