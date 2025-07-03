import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper function untuk mengubah string waktu "HH:mm" menjadi total menit dari tengah malam.
 * @param {string} timeString - String waktu, contoh: "08:30".
 * @returns {number} Total menit.
 */
function timeStringToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Helper function untuk mendapatkan jumlah hari kerja (selain Minggu) dalam sebulan.
 * @param {number} year - Tahun.
 * @param {number} month - Bulan (1-12).
 * @returns {number} Jumlah hari kerja.
 */
function getWorkingDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        if (currentDate.getDay() !== 0) { // Jika bukan hari Minggu
            workingDays++;
        }
    }
    return workingDays;
}


/**
 * Memproses daftar absensi mentah menjadi sesi kerja yang valid.
 * @param {Array} absensiRecords - Daftar absensi dari database.
 * @param {string} mode - 'multi-session' atau 'single-session-daily'.
 * @returns {Array} Daftar sesi kerja, setiap sesi memiliki {masuk, keluar}.
 */
function processAbsensiIntoSessions(absensiRecords, mode) {
    const sessions = [];
    const sortedAbsensi = absensiRecords.sort((a, b) => a.createdAt - b.createdAt);

    if (mode === 'multi-session') {
        let lastMasuk = null;
        for (const abs of sortedAbsensi) {
            if (abs.tipe === 'MASUK') {
                if (!lastMasuk) {
                    lastMasuk = abs.createdAt;
                }
            } else if (abs.tipe === 'KELUAR' && lastMasuk) {
                sessions.push({ masuk: lastMasuk, keluar: abs.createdAt });
                lastMasuk = null; 
            }
        }
    } else { // mode 'single-session-daily'
        const dailyData = {};
        sortedAbsensi.forEach(abs => {
            const date = abs.createdAt.toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { masuks: [], keluars: [] };
            }
            if (abs.tipe === 'MASUK') dailyData[date].masuks.push(abs.createdAt);
            if (abs.tipe === 'KELUAR') dailyData[date].keluars.push(abs.createdAt);
        });

        for (const date in dailyData) {
            if (dailyData[date].masuks.length > 0 && dailyData[date].keluars.length > 0) {
                const masuk = dailyData[date].masuks[0]; 
                const keluar = dailyData[date].keluars[dailyData[date].keluars.length - 1];
                sessions.push({ masuk, keluar });
            }
        }
    }
    return sessions;
}


export async function calculateSalary(karyawanId, startDate, endDate) {
    const karyawan = await prisma.karyawan.findUnique({
        where: { id: karyawanId },
        include: { tipeGaji: true },
    });

    if (!karyawan || !karyawan.tipeGaji) {
        throw new Error(`Karyawan dengan ID ${karyawanId} tidak ditemukan atau belum memiliki tipe gaji.`);
    }

    const { tipeGaji } = karyawan;

    const absensiRecords = await prisma.absensi.findMany({
        where: {
            karyawanId,
            createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: 'asc' },
    });

    let totalGaji = 0;
    
    switch (tipeGaji.model_perhitungan) {
        case 'PER_JAM_BERTINGKAT': {
            const workSessions = processAbsensiIntoSessions(absensiRecords, 'multi-session');
            const aturanTarif = JSON.parse(tipeGaji.aturan_tarif_per_jam || '[]');
            if (aturanTarif.length === 0) return { totalGaji: 0 };

            const tarifPerMenitMap = aturanTarif.map(aturan => ({
                mulai: timeStringToMinutes(aturan.mulai),
                selesai: timeStringToMinutes(aturan.selesai),
                tarifPerMenit: parseFloat(aturan.tarif) / 60,
            }));

            for (const session of workSessions) {
                const masukMenit = session.masuk.getHours() * 60 + session.masuk.getMinutes();
                const keluarMenit = session.keluar.getHours() * 60 + session.keluar.getMinutes();
                
                for (let menit = masukMenit; menit < keluarMenit; menit++) {
                    const menitDalamHari = menit % 1440;
                    
                    for (const aturan of tarifPerMenitMap) {
                        if (aturan.mulai > aturan.selesai) { 
                            if (menitDalamHari >= aturan.mulai || menitDalamHari < aturan.selesai) {
                                totalGaji += aturan.tarifPerMenit;
                                break;
                            }
                        } else {
                            if (menitDalamHari >= aturan.mulai && menitDalamHari < aturan.selesai) {
                                totalGaji += aturan.tarifPerMenit;
                                break;
                            }
                        }
                    }
                }
            }
            break;
        }
        
        case 'HARIAN': {
            const workSessions = processAbsensiIntoSessions(absensiRecords, 'single-session-daily');
            const standarJamKerjaMenit = 9 * 60; 

            let gajiPokokTotal = 0;
            let gajiLemburTotal = 0;

            for (const session of workSessions) {
                const durasiMenit = (session.keluar - session.masuk) / (1000 * 60);
                
                if (durasiMenit > 0) {
                    const tarifHarian = tipeGaji.nilai_gaji_dasar || 0;
                    const tarifPerMenit = tarifHarian / standarJamKerjaMenit;

                    if (durasiMenit > standarJamKerjaMenit) {
                        gajiPokokTotal += tarifHarian;
                        
                        const menitLembur = durasiMenit - standarJamKerjaMenit;
                        const tarifLemburPerMenit = (tipeGaji.tarif_lembur_per_jam || 0) / 60;
                        gajiLemburTotal += menitLembur * tarifLemburPerMenit;
                    } else {
                        gajiPokokTotal += durasiMenit * tarifPerMenit;
                    }
                }
            }
            
            totalGaji = gajiPokokTotal + gajiLemburTotal;
            break;
        }

        case 'BULANAN': {
            const workSessions = processAbsensiIntoSessions(absensiRecords, 'single-session-daily');
            
            const year = startDate.getFullYear();
            const month = startDate.getMonth() + 1;
            const jumlahHariKerjaSebulan = getWorkingDaysInMonth(year, month);
            
            const gajiPokok = tipeGaji.nilai_gaji_dasar || 0;
            
            if (jumlahHariKerjaSebulan === 0) {
                totalGaji = 0;
            } else {
                // DIUBAH: Logika prorata diterapkan
                const upahPerHari = gajiPokok / jumlahHariKerjaSebulan;
                const jumlahHariMasuk = workSessions.length;
                totalGaji = jumlahHariMasuk * upahPerHari;
            }
            
            // Di masa depan, logika lembur bisa ditambahkan di sini
            break;
        }

        default:
            totalGaji = 0;
            break;
    }

    return {
        karyawanId: karyawan.id,
        nama: karyawan.nama_lengkap,
        periode: `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`,
        totalGaji: Math.round(totalGaji),
    };
}
