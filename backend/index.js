import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { calculateSalary } from './services/gajiService.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = 3001;

app.use(cors());
app.use(express.json());

// =================================================================
// === AUTHENTICATION & MIDDLEWARE =================================
// =================================================================

// Middleware untuk memeriksa header 'x-user-id'
const authMiddleware = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'Akses ditolak. Header x-user-id tidak ditemukan.' });
    }
    req.userId = parseInt(userId, 10);
    next();
};

// Endpoint Login
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username wajib diisi.' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan.' });
        }
        res.json({ id: user.id, username: user.username, namaPerusahaan: user.namaPerusahaan });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


// =================================================================
// === API ENDPOINTS (DENGAN MULTI-TENANCY) ========================
// =================================================================

app.use('/api', authMiddleware);

// --- Tipe Gaji ---
app.get('/api/tipegaji', async (req, res) => {
    try {
        const tipeGaji = await prisma.tipeGaji.findMany({ where: { userId: req.userId }, orderBy: { nama: 'asc' } });
        res.json(tipeGaji);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/tipegaji', async (req, res) => {
    const data = { ...req.body, userId: req.userId };
    try {
        const newTipeGaji = await prisma.tipeGaji.create({
            data: {
                ...data,
                nilai_gaji_dasar: data.nilai_gaji_dasar ? parseFloat(data.nilai_gaji_dasar) : null,
                potongan_tidak_masuk: data.potongan_tidak_masuk ? parseFloat(data.potongan_tidak_masuk) : null,
                tarif_lembur_per_jam: data.tarif_lembur_per_jam ? parseFloat(data.tarif_lembur_per_jam) : null,
                aturan_tarif_per_jam: (data.model_perhitungan === 'PER_JAM_BERTINGKAT' && data.aturan_tarif_per_jam) ? JSON.stringify(data.aturan_tarif_per_jam) : null,
            }
        });
        res.status(201).json(newTipeGaji);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/tipegaji/:id', async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };
    try {
        const updatedTipeGaji = await prisma.tipeGaji.update({
            where: { id: parseInt(id), userId: req.userId },
            data: {
                ...data,
                 nilai_gaji_dasar: data.nilai_gaji_dasar ? parseFloat(data.nilai_gaji_dasar) : null,
                potongan_tidak_masuk: data.potongan_tidak_masuk ? parseFloat(data.potongan_tidak_masuk) : null,
                tarif_lembur_per_jam: data.tarif_lembur_per_jam ? parseFloat(data.tarif_lembur_per_jam) : null,
                aturan_tarif_per_jam: (data.model_perhitungan === 'PER_JAM_BERTINGKAT' && data.aturan_tarif_per_jam) ? JSON.stringify(data.aturan_tarif_per_jam) : null,
            }
        });
        res.json(updatedTipeGaji);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/tipegaji/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.tipeGaji.delete({ where: { id: parseInt(id), userId: req.userId } });
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- Karyawan ---
app.get('/api/karyawan', async (req, res) => {
    try {
        const karyawan = await prisma.karyawan.findMany({ where: { userId: req.userId }, orderBy: { nama_lengkap: 'asc' } });
        res.json(karyawan.map(k => ({ ...k, telegram_id: k.telegram_id.toString() })));
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const karyawan = await prisma.karyawan.findFirst({ where: { id: parseInt(id), userId: req.userId }, include: { tipeGaji: true } });
        if (!karyawan) return res.status(404).json({ message: 'Karyawan tidak ditemukan.' });
        
        const absensiMentah = await prisma.absensi.findMany({ where: { karyawanId: parseInt(id) }, orderBy: { createdAt: 'asc' } });
        
        const sessions = [];
        let tempMasuk = null;
        for (const abs of absensiMentah) {
            if (abs.tipe === 'MASUK') {
                if (!tempMasuk) tempMasuk = abs;
            } else if (abs.tipe === 'KELUAR' && tempMasuk) {
                sessions.push({ masuk: tempMasuk, keluar: abs });
                tempMasuk = null;
            }
        }
        if (tempMasuk) {
            sessions.push({ masuk: tempMasuk, keluar: null });
        }

        const laporanAbsensi = sessions.map(session => {
            const { masuk, keluar } = session;
            let totalMenit = 0;
            let status = 'Invalid';

            if (masuk && keluar) {
                const diffMs = keluar.createdAt - masuk.createdAt;
                if (diffMs >= 0) {
                    totalMenit = diffMs / (1000 * 60);
                    status = 'Valid';
                }
            }

            return {
                idMasuk: masuk.id,
                idKeluar: keluar ? keluar.id : null,
                tanggal: masuk.createdAt.toISOString().split('T')[0],
                hari: masuk.createdAt.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                masuk: masuk.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                keluar: keluar ? keluar.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
                status,
                total: `${(totalMenit / 60).toFixed(1)} jam`,
            };
        });
        
        res.json({ ...karyawan, telegram_id: karyawan.telegram_id.toString(), laporanAbsensi });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    const { jabatan, tipeGajiId } = req.body;
    const dataToUpdate = {};
    if (jabatan !== undefined) dataToUpdate.jabatan = jabatan;
    if (tipeGajiId !== undefined) dataToUpdate.tipeGajiId = tipeGajiId;

    try {
        const updatedKaryawan = await prisma.karyawan.update({ where: { id: parseInt(id), userId: req.userId }, data: dataToUpdate });
        res.json({ ...updatedKaryawan, telegram_id: updatedKaryawan.telegram_id.toString() });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/karyawan/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction([
            prisma.absensi.deleteMany({ where: { karyawan: { id: parseInt(id), userId: req.userId } } }),
            prisma.karyawan.delete({ where: { id: parseInt(id), userId: req.userId } }),
        ]);
        res.status(200).json({ message: 'Karyawan berhasil dihapus' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- Absensi ---
app.post('/api/absensi/harian', async (req, res) => {
    const { karyawanId, tanggal, jamMasuk, jamKeluar, idMasuk, idKeluar } = req.body;
    try {
        const karyawan = await prisma.karyawan.findFirst({ where: { id: parseInt(karyawanId), userId: req.userId } });
        if (!karyawan) return res.status(403).json({ message: 'Akses ditolak.' });

        const tgl = new Date(tanggal);

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
        
        res.status(200).json({ message: 'Absensi berhasil diperbarui' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});


// --- Dashboard ---
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const totalKaryawan = await prisma.karyawan.count({ where: { userId: req.userId } });
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const hadirHariIniResult = await prisma.absensi.findMany({
            where: {
                karyawan: { userId: req.userId },
                tipe: 'MASUK',
                createdAt: { gte: startOfToday, lte: endOfToday }
            },
            select: { karyawanId: true },
            distinct: ['karyawanId']
        });
        const hadirHariIni = hadirHariIniResult.length;

        const allKaryawan = await prisma.karyawan.findMany({ where: { userId: req.userId, tipeGajiId: { not: null } } });
        let totalGajiBulanIni = 0;
        
        const salaryPromises = allKaryawan.map(k => calculateSalary(k.id, startOfMonth, endOfMonth));
        const results = await Promise.all(salaryPromises);
        
        totalGajiBulanIni = results.reduce((sum, result) => sum + result.totalGaji, 0);

        res.json({ totalKaryawan, hadirHariIni, totalGajiBulanIni, rataRataJamKerja: 0 });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/dashboard/aktivitas-terbaru', async (req, res) => {
    try {
        const aktivitas = await prisma.absensi.findMany({
            where: { karyawan: { userId: req.userId } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { karyawan: { select: { nama_lengkap: true } } }
        });
        res.json(aktivitas);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil aktivitas terbaru', error: error.message });
    }
});

app.get('/api/gaji/rincian-bulan-ini', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const allKaryawan = await prisma.karyawan.findMany({
            where: { userId: req.userId, tipeGajiId: { not: null } },
            include: { tipeGaji: true }
        });

        const salaryPromises = allKaryawan.map(k => calculateSalary(k.id, startOfMonth, endOfMonth));
        const results = await Promise.all(salaryPromises);

        const rincianGaji = results.map(r => ({
            name: r.nama,
            position: allKaryawan.find(k => k.id === r.karyawanId)?.jabatan || 'N/A',
            amount: r.totalGaji
        }));

        res.json(rincianGaji);

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil rincian gaji', error: error.message });
    }
});


// =================================================================
// === BOT TELEGRAM MANAGER ========================================
// =================================================================

const botInstances = new Map();
const userActionState = {}; // Pindahkan ke scope yang lebih tinggi

async function initializeBots() {
    console.log("Menginisialisasi bot Telegram...");
    const users = await prisma.user.findMany();

    for (const user of users) {
        if (user.botToken) {
            const bot = new TelegramBot(user.botToken, { polling: true });
            botInstances.set(user.id, bot);

            console.log(`Bot untuk ${user.namaPerusahaan} (User ID: ${user.id}) telah diinisialisasi.`);

            bot.onText(/\/registrasi (.+)/, async (msg, match) => {
                const chatId = msg.chat.id;
                const telegramId = msg.from.id;
                const namaLengkap = match[1];

                try {
                    const karyawanExist = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
                    if (karyawanExist) {
                        return bot.sendMessage(chatId, '❌ Anda sudah terdaftar di sistem.');
                    }
                    
                    await prisma.karyawan.create({
                        data: {
                            telegram_id: BigInt(telegramId),
                            nama_lengkap: namaLengkap,
                            userId: user.id,
                        },
                    });
                    bot.sendMessage(chatId, `✅ Registrasi berhasil! Selamat datang, ${namaLengkap}.`);
                } catch (error) {
                    console.error('Gagal registrasi:', error);
                    bot.sendMessage(chatId, 'Terjadi kesalahan saat registrasi.');
                }
            });

            bot.onText(/\/absen/, async (msg) => {
                const chatId = msg.chat.id;
                const telegramId = msg.from.id;
                const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
                if (!karyawan || karyawan.userId !== user.id) {
                    return bot.sendMessage(chatId, '❌ Anda belum terdaftar di perusahaan ini.');
                }
                const options = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '➡️ Absen Masuk', callback_data: 'absen_masuk' }, { text: '⬅️ Absen Keluar', callback_data: 'absen_keluar' }],
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
                    return bot.sendMessage(chatId, 'Silakan mulai dengan perintah /absen terlebih dahulu.');
                }
                try {
                    const karyawan = await prisma.karyawan.findUnique({ where: { telegram_id: BigInt(telegramId) } });
                    if (!karyawan || karyawan.userId !== user.id) {
                        return bot.sendMessage(chatId, '❌ Anda tidak terdaftar di perusahaan ini.');
                    }
                    
                    // Di dunia nyata, koordinat kantor akan diambil dari database per user
                    // const OFFICE_COORDINATES = { latitude: user.officeLat, longitude: user.officeLon };
                    // const MAX_DISTANCE_METERS = user.maxDistance;
                    
                    await prisma.absensi.create({
                        data: {
                            tipe: tipeAbsen,
                            latitude: latitude,
                            longitude: longitude,
                            karyawanId: karyawan.id,
                        },
                    });
                    bot.sendMessage(chatId, `✅ Absen ${tipeAbsen} berhasil pada pukul ${new Date().toLocaleTimeString('id-ID')}.`);
                } catch (error) {
                    console.error('Gagal proses lokasi:', error);
                    bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses lokasi Anda.');
                } finally {
                    delete userActionState[telegramId];
                }
            });

            bot.on('message', (msg) => {
                if (msg.location || msg.text.startsWith('/registrasi') || msg.text.startsWith('/absen')) {
                    return;
                }
                bot.sendMessage(msg.chat.id, 'Perintah tidak dikenali. Gunakan `/registrasi` atau `/absen`.');
            });

            bot.on('polling_error', (error) => {
                console.log(`Polling error untuk bot user ${user.id}: ${error.code}`);
            });
        }
    }
}

initializeBots().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});
