import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

dotenv.config();

// --- KONFIGURASI & INISIALISASI ---
const app = express();
const prisma = new PrismaClient();
const port = 3001;
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL || 'https://c3cd-140-213-187-186.ngrok-free.app'; 

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- FUNGSI SEEDING PENGATURAN ---
async function seedPengaturan() {
  const jamLemburMinggu = await prisma.pengaturan.findUnique({
    where: { nama: 'jam_lembur_minggu' },
  });

  if (!jamLemburMinggu) {
    console.log('Membuat pengaturan default untuk jam_lembur_minggu...');
    await prisma.pengaturan.create({
      data: {
        nama: 'jam_lembur_minggu',
        nilai: '4', // Nilai tetap dalam jam di database
        deskripsi: 'Jumlah jam default yang ditambahkan untuk kerja di hari Minggu.',
      },
    });
  }
}

seedPengaturan().catch((e) => {
  console.error('Gagal melakukan seeding pengaturan:', e);
  process.exit(1);
});


// =================================================================
// === API ENDPOINTS UNTUK FRONTEND ================================
// =================================================================

// --- Endpoint Pengaturan ---
app.get('/api/pengaturan', async (req, res) => {
    try {
        const pengaturan = await prisma.pengaturan.findMany();
        res.json(pengaturan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengaturan', error: error.message });
    }
});

app.patch('/api/pengaturan/:nama', async (req, res) => {
    const { nama } = req.params;
    const { nilai } = req.body;
    try {
        const updatedPengaturan = await prisma.pengaturan.update({
            where: { nama },
            data: { nilai },
        });
        res.json(updatedPengaturan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pengaturan', error: error.message });
    }
});


// --- Endpoint Karyawan ---
app.get('/api/karyawan', async (req, res) => {
    try {
        const karyawan = await prisma.karyawan.findMany({
            orderBy: { nama_lengkap: 'asc' }
        });
        const karyawanSerializable = karyawan.map(k => ({
            ...k,
            telegram_id: k.telegram_id.toString(),
        }));
        res.json(karyawanSerializable);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data karyawan', error: error.message });
    }
});

app.get('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const karyawan = await prisma.karyawan.findUnique({
            where: { id: parseInt(id) },
        });

        if (!karyawan) {
            return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
        }

        const pengaturanLembur = await prisma.pengaturan.findUnique({
            where: { nama: 'jam_lembur_minggu' },
        });
        const jamLemburMingguMenit = pengaturanLembur ? parseFloat(pengaturanLembur.nilai) * 60 : 0;

        const absensiMentah = await prisma.absensi.findMany({
            where: { karyawanId: parseInt(id) },
            orderBy: { createdAt: 'asc' },
        });

        const absensiByDate = {};
        absensiMentah.forEach(abs => {
            const tanggal = abs.createdAt.toISOString().split('T')[0];
            if (!absensiByDate[tanggal]) {
                absensiByDate[tanggal] = { tanggal: new Date(tanggal), masuk: null, keluar: null, idMasuk: null, idKeluar: null };
            }
            if (abs.tipe === 'MASUK' && !absensiByDate[tanggal].masuk) {
                absensiByDate[tanggal].masuk = abs.createdAt;
                absensiByDate[tanggal].idMasuk = abs.id;
            }
            if (abs.tipe === 'KELUAR') {
                absensiByDate[tanggal].keluar = abs.createdAt;
                absensiByDate[tanggal].idKeluar = abs.id;
            }
        });
        
        const laporanAbsensi = Object.values(absensiByDate).map(data => {
            let totalMenit = 0;
            let status = 'Invalid';
            const isMinggu = data.tanggal.getDay() === 0;

            if (data.masuk && data.keluar) {
                const diffMs = data.keluar - data.masuk;
                if (diffMs >= 0) {
                    totalMenit = diffMs / (1000 * 60);
                    status = 'Valid';
                }
            }

            if (isMinggu) {
                totalMenit += jamLemburMingguMenit;
            }
            
            if (!data.masuk && !data.keluar && !isMinggu) {
                status = 'Tidak Hadir';
            } else if (!data.masuk && !data.keluar && isMinggu) {
                status = 'Libur';
            }

            // DIUBAH: Mengembalikan DUA format: totalMenit (angka) dan total (teks jam)
            return {
                tanggal: data.tanggal.toISOString().split('T')[0],
                idMasuk: data.idMasuk,
                idKeluar: data.idKeluar,
                hari: data.tanggal.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                masuk: data.masuk ? data.masuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                keluar: data.keluar ? data.keluar.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                status,
                totalMenit: Math.round(totalMenit),
                total: `${(totalMenit / 60).toFixed(1)} jam`,
            };
        });

        res.json({
            ...karyawan,
            telegram_id: karyawan.telegram_id.toString(),
            laporanAbsensi: laporanAbsensi, 
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail karyawan', error: error.message });
    }
});

app.patch('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    const { jabatan } = req.body;
    try {
        const updatedKaryawan = await prisma.karyawan.update({
            where: { id: parseInt(id) },
            data: { jabatan },
        });
        res.json({ ...updatedKaryawan, telegram_id: updatedKaryawan.telegram_id.toString() });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengubah jabatan', error: error.message });
    }
});

app.delete('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.absensi.deleteMany({
            where: { karyawanId: parseInt(id) },
        });
        await prisma.karyawan.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: 'Karyawan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus karyawan', error: error.message });
    }
});

// --- Endpoint Absensi ---
app.post('/api/absensi/harian', async (req, res) => {
    const { karyawanId, tanggal, jamMasuk, jamKeluar, idMasuk, idKeluar } = req.body;

    try {
        const tgl = new Date(tanggal);

        // Handle Jam Masuk
        if (jamMasuk) {
            const [jam, menit] = jamMasuk.split(':');
            const newDate = new Date(new Date(tgl).setHours(jam, menit, 0, 0));
            if (idMasuk) {
                await prisma.absensi.update({ where: { id: idMasuk }, data: { createdAt: newDate } });
            } else {
                await prisma.absensi.create({ data: { tipe: 'MASUK', createdAt: newDate, karyawanId: parseInt(karyawanId), latitude: 0, longitude: 0 } });
            }
        } else if (idMasuk) {
            await prisma.absensi.delete({ where: { id: idMasuk } });
        }

        // Handle Jam Keluar
        if (jamKeluar) {
            const [jam, menit] = jamKeluar.split(':');
            const newDate = new Date(new Date(tgl).setHours(jam, menit, 0, 0));
            if (idKeluar) {
                await prisma.absensi.update({ where: { id: idKeluar }, data: { createdAt: newDate } });
            } else {
                await prisma.absensi.create({ data: { tipe: 'KELUAR', createdAt: newDate, karyawanId: parseInt(karyawanId), latitude: 0, longitude: 0 } });
            }
        } else if (idKeluar) {
            await prisma.absensi.delete({ where: { id: idKeluar } });
        }

        res.status(200).json({ message: 'Absensi harian berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui absensi harian', error: error.message });
    }
});


// =================================================================
// === LOGIKA BOT TELEGRAM =========================================
// =================================================================

const OFFICE_COORDINATES = { latitude: -7.876258, longitude: 111.480758 };
const MAX_DISTANCE_METERS = 100;
const userActionState = {};

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const bot = new TelegramBot(token);
bot.setWebHook(`${webhookUrl}/telegram/webhook`);
app.post('/telegram/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

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

bot.onText(/\/absen/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
  if (!karyawan) {
    bot.sendMessage(chatId, '❌ Anda belum terdaftar. Silakan ketik `/registrasi Nama Lengkap Anda` terlebih dahulu.');
    return;
  }
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

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const telegramId = callbackQuery.from.id;
  const action = callbackQuery.data;
  userActionState[telegramId] = action === 'absen_masuk' ? 'MASUK' : 'KELUAR';
  const options = {
    reply_markup: {
      keyboard: [
        [{ text: '📍 Bagikan Lokasi Saat Ini', request_location: true }],
      ],
      one_time_keyboard: true,
    },
  };
  bot.sendMessage(chatId, `Anda memilih Absen ${userActionState[telegramId]}. Sekarang, silakan bagikan lokasi Anda.`, options);
});

bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const { latitude, longitude } = msg.location;
  const tipeAbsen = userActionState[telegramId];
  if (!tipeAbsen) {
    bot.sendMessage(chatId, 'Silakan mulai dengan perintah /absen terlebih dahulu.');
    return;
  }
  try {
    const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
    if (!karyawan) {
      bot.sendMessage(chatId, '❌ Anda belum terdaftar.');
      return;
    }
    const distance = getDistance(latitude, longitude, OFFICE_COORDINATES.latitude, OFFICE_COORDINATES.longitude);
    if (distance > MAX_DISTANCE_METERS) {
      bot.sendMessage(chatId, `❌ Gagal! Jarak Anda dari kantor adalah ${Math.round(distance)} meter. Anda berada di luar radius ${MAX_DISTANCE_METERS} meter.`);
      return;
    }
    await prisma.absensi.create({
      data: {
        tipe: tipeAbsen,
        latitude: latitude,
        longitude: longitude,
        karyawanId: karyawan.id,
      },
    });
    bot.sendMessage(chatId, `✅ Absen ${tipeAbsen} berhasil pada pukul ${new Date().toLocaleTimeString('id-ID')}. Jarak Anda ${Math.round(distance)} meter dari kantor.`);
    console.log(`Absensi berhasil: ${karyawan.nama_lengkap} - ${tipeAbsen}`);
  } catch (error) {
    console.error('Gagal proses lokasi:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses lokasi Anda.');
  } finally {
    delete userActionState[telegramId];
  }
});

bot.on('message', (msg) => {
  if (msg.location) return;
  if (msg.text && (msg.text.startsWith('/registrasi') || msg.text.startsWith('/absen'))) {
      return;
  }
  bot.sendMessage(msg.chat.id, 'Perintah tidak dikenali. Gunakan `/registrasi` atau `/absen`.');
});

app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
  console.log(`Webhook Telegram diatur ke ${webhookUrl}/telegram/webhook`);
});
