import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

// Impor layanan dan rute baru
import { calculateSalary, processAbsensiIntoSessions, roundTimeToNearestQuarter } from './services/gajiService.js';
import { verifyJwt } from './services/securityService.js';
import authRoutes from './routes/authRoutes.js';
import { initializeAllBots } from './services/botManager.js'; // DIUBAH

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// =================================================================
// === SISTEM OTENTIKASI ===========================================
// =================================================================

app.use('/api/auth', authRoutes);

const authMiddleware = async (req, res, next) => { // DIUBAH menjadi async
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan atau format salah.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const payload = verifyJwt(token);
        if (!payload || !payload.id) {
            return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
        }

        // PENGECEKAN PENTING: Pastikan user masih ada di database
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
        });

        if (!user) {
            // Jika user tidak ditemukan, token ini tidak valid lagi
            return res.status(401).json({ message: 'Sesi tidak valid. Silakan login kembali.' });
        }

        req.userId = user.id; // Gunakan ID dari user yang terverifikasi
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid.' });
    }
};

// =================================================================
// === API ENDPOINTS ===============================================
// =================================================================

app.use('/api', authMiddleware);

// --- Tipe Gaji (TANPA PERUBAHAN) ---
app.get('/api/tipegaji', async (req, res) => {
    try {
        const tipeGaji = await prisma.tipeGaji.findMany({ where: { userId: req.userId }, orderBy: { nama: 'asc' } });
        res.json(tipeGaji);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/tipegaji', async (req, res) => {
    const { body, userId } = req;

    console.log('Mencoba membuat TipeGaji dengan userId:', userId); // TAMBAHKAN BARIS INI

    try {
        // Susun data secara eksplisit untuk memastikan integritas
        const dataForDb = {
            userId: userId, // Pastikan userId dari middleware disertakan
            nama: body.nama,
            model_perhitungan: body.model_perhitungan,
            nilai_gaji_dasar: body.nilai_gaji_dasar ? parseFloat(body.nilai_gaji_dasar) : null,
            potongan_tidak_masuk: body.potongan_tidak_masuk ? parseFloat(body.potongan_tidak_masuk) : null,
            tarif_lembur_per_jam: body.tarif_lembur_per_jam ? parseFloat(body.tarif_lembur_per_jam) : null,
            aturan_tarif_per_jam: (body.model_perhitungan === 'PER_JAM_BERTINGKAT' && body.aturan_tarif_per_jam) ? JSON.stringify(body.aturan_tarif_per_jam) : null,
        };

        const newTipeGaji = await prisma.tipeGaji.create({ data: dataForDb });
        res.status(201).json(newTipeGaji);
    } catch (error) { 
        console.error('POST /tipegaji error:', error);
        res.status(500).json({ message: 'Gagal membuat tipe gaji baru.' }); 
    }
});

app.put('/api/tipegaji/:id', async (req, res) => {
    const { id } = req.params;
    const { body, userId } = req;

    try {
        // Susun data yang akan diupdate secara eksplisit
        const dataForUpdate = {
            nama: body.nama,
            model_perhitungan: body.model_perhitungan,
            nilai_gaji_dasar: body.nilai_gaji_dasar ? parseFloat(body.nilai_gaji_dasar) : null,
            potongan_tidak_masuk: body.potongan_tidak_masuk ? parseFloat(body.potongan_tidak_masuk) : null,
            tarif_lembur_per_jam: body.tarif_lembur_per_jam ? parseFloat(body.tarif_lembur_per_jam) : null,
            aturan_tarif_per_jam: (body.model_perhitungan === 'PER_JAM_BERTINGKAT' && body.aturan_tarif_per_jam) ? JSON.stringify(body.aturan_tarif_per_jam) : null,
        };

        const updatedTipeGaji = await prisma.tipeGaji.update({
            where: { id: parseInt(id), userId: userId }, // Otorisasi: pastikan user hanya mengubah miliknya
            data: dataForUpdate,
        });
        res.json(updatedTipeGaji);
    } catch (error) { 
        console.error('PUT /tipegaji/:id error:', error);
        res.status(500).json({ message: 'Gagal memperbarui tipe gaji.' }); 
    }
});

app.delete('/api/tipegaji/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.tipeGaji.delete({ where: { id: parseInt(id), userId: req.userId } });
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: error.message }); }
});


// --- Karyawan & Endpoint Lainnya (TANPA PERUBAHAN) ---
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
            let status = 'Invalid';

            // Lakukan pembulatan waktu di sini
            const masukDibulatkan = masuk ? roundTimeToNearestQuarter(masuk.createdAt, 'up') : null;
            const keluarDibulatkan = keluar ? roundTimeToNearestQuarter(keluar.createdAt, 'down') : null;

            // Hitung total menit berdasarkan waktu yang SUDAH DIBULATKAN
            let totalMenit = 0;
            if (masukDibulatkan && keluarDibulatkan) {
                const diffMs = keluarDibulatkan - masukDibulatkan;
                if (diffMs >= 0) {
                    totalMenit = diffMs / (1000 * 60);
                    status = 'Valid';
                }
            }

            return {
                idMasuk: masuk.id,
                idKeluar: keluar ? keluar.id : null,
                masuk: masuk.createdAt.toISOString(), // Waktu asli
                keluar: keluar ? keluar.createdAt.toISOString() : null, // Waktu asli
                masukDibulatkan: masukDibulatkan ? masukDibulatkan.toISOString() : null, // Waktu bulat
                keluarDibulatkan: keluarDibulatkan ? keluarDibulatkan.toISOString() : null, // Waktu bulat
                status,
                total: `${(totalMenit / 60).toFixed(1)} jam`, // Total jam dari waktu bulat
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
        await prisma.karyawan.delete({ where: { id: parseInt(id), userId: req.userId } });
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

        // --- Perhitungan Total Karyawan & Hadir Hari Ini (Tetap sama) ---
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

        // --- Perhitungan Total Gaji (Tetap sama) ---
        const allKaryawanGaji = await prisma.karyawan.findMany({ where: { userId: req.userId, tipeGajiId: { not: null } } });
        const salaryPromises = allKaryawanGaji.map(k => calculateSalary(k.id, startOfMonth, endOfMonth));
        const salaryResults = await Promise.all(salaryPromises);
        const totalGajiBulanIni = salaryResults.reduce((sum, result) => sum + result.totalGaji, 0);
        
        // --- LOGIKA BARU: Perhitungan Rata-rata Jam Kerja ---
        const absensiBulanIni = await prisma.absensi.findMany({
            where: {
                karyawan: { userId: req.userId },
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        const workSessions = processAbsensiIntoSessions(absensiBulanIni, 'single-session-daily');
        
        let totalMenitKerja = 0;
        if (workSessions.length > 0) {
            totalMenitKerja = workSessions.reduce((total, session) => {
                const durasiMenit = (session.keluar - session.masuk) / (1000 * 60);
                return total + (durasiMenit > 0 ? durasiMenit : 0);
            }, 0);
        }
        
        const rataRataJamKerja = workSessions.length > 0
            ? (totalMenitKerja / workSessions.length) / 60
            : 0;

        // --- Kirim Respons dengan data yang sudah dihitung ---
        res.json({ 
            totalKaryawan, 
            hadirHariIni, 
            totalGajiBulanIni, 
            rataRataJamKerja: parseFloat(rataRataJamKerja.toFixed(1)) 
        });

    } catch (error) { 
        console.error("Error di /dashboard/summary:", error);
        res.status(500).json({ message: error.message }); 
    }
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

app.get('/api/gaji/slip-status', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const allKaryawan = await prisma.karyawan.findMany({
            where: { userId: req.userId },
            orderBy: { nama_lengkap: 'asc' },
            include: { tipeGaji: true }
        });

        const statusPromises = allKaryawan.map(async (karyawan) => {
            if (!karyawan.tipeGaji) {
                return {
                    id: karyawan.id,
                    nama: karyawan.nama_lengkap,
                    jabatan: karyawan.jabatan || 'N/A',
                    status: 'Menunggu' // Atau 'Tipe Gaji Belum Diatur'
                };
            }

            const salaryData = await calculateSalary(karyawan.id, startOfMonth, endOfMonth);
            return {
                id: karyawan.id,
                nama: karyawan.nama_lengkap,
                jabatan: karyawan.jabatan || 'N/A',
                status: salaryData.totalGaji > 0 ? 'Tersedia' : 'Menunggu'
            };
        });

        const results = await Promise.all(statusPromises);
        res.json(results);

    } catch (error) {
        console.error("Error di /gaji/slip-status:", error);
        res.status(500).json({ message: 'Gagal mengambil status slip gaji', error: error.message });
    }
});

// =================================================================
// === BOT TELEGRAM MANAGER ========================================
// =================================================================

// DIUBAH: Panggil fungsi dari botManager
initializeAllBots().catch(console.error);

app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});
