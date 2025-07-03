import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
import { decryptToken } from './securityService.js';

const prisma = new PrismaClient();
const botInstances = new Map();
const userActionState = {};

/**
 * Fungsi inti untuk memulai satu instance bot untuk satu user.
 * @param {object} user - Objek user dari database.
 */
export const startBotForUser = (user) => {
  if (!user || !user.botToken || !user.botTokenIv) {
    console.log(`User ${user.id} tidak memiliki token bot yang valid.`);
    return;
  }
  
  // Hentikan bot lama jika ada (untuk mencegah duplikat saat update)
  if (botInstances.has(user.id)) {
    botInstances.get(user.id).stopPolling();
    botInstances.delete(user.id);
  }

  try {
    const decryptedToken = decryptToken(user.botToken, user.botTokenIv);
    const bot = new TelegramBot(decryptedToken, { polling: true });
    botInstances.set(user.id, bot);

    console.log(`✅ Bot untuk ${user.namaPerusahaan} (User ID: ${user.id}) telah diinisialisasi.`);

    // --- SEMUA LOGIKA EVENT LISTENER BOT DIPINDAHKAN KE SINI ---
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
        if (msg.location || (msg.text && (msg.text.startsWith('/registrasi') || msg.text.startsWith('/absen')))) {
            return;
        }
        bot.sendMessage(msg.chat.id, 'Perintah tidak dikenali. Gunakan `/registrasi` atau `/absen`.');
    });

    bot.on('polling_error', (error) => {
        console.log(`Polling error untuk bot user ${user.id}: ${error.code} - ${error.message}`);
    });

  } catch (error) {
    console.error(`❌ Gagal menginisialisasi bot untuk user ${user.id} (${user.namaPerusahaan}):`, error.message);
  }
};

/**
 * Menginisialisasi semua bot untuk user yang sudah terverifikasi saat server startup.
 */
export const initializeAllBots = async () => {
    console.log("Menginisialisasi bot Telegram untuk user yang sudah ada...");
    const users = await prisma.user.findMany({ where: { emailVerifiedAt: { not: null } } });

    for (const user of users) {
        startBotForUser(user);
    }
};
