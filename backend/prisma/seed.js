import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // --- GANTI DATA DI BAWAH INI ---
  const usersToCreate = [
    {
      username: 'perusahaan_a', // Ganti dengan username login untuk perusahaan pertama
      namaPerusahaan: 'Perusahaan A (Live Host)',
      botToken: 'TOKEN_BOT_ANDA_YANG_PERTAMA', // GANTI DENGAN TOKEN BOT PERTAMA
    },
    {
      username: 'perusahaan_b', // Ganti dengan username login untuk perusahaan kedua
      namaPerusahaan: 'Perusahaan B (Karyawan Bulanan)',
      botToken: 'TOKEN_BOT_ANDA_YANG_KEDUA', // GANTI DENGAN TOKEN BOT KEDUA
    },
  ];
  // --------------------------------

  for (const userData of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        namaPerusahaan: userData.namaPerusahaan,
        botToken: userData.botToken,
      },
    });

    console.log(`User dibuat/ditemukan: ${user.username} dengan ID: ${user.id}`);

    // Membuat pengaturan default untuk setiap user
    await prisma.pengaturan.upsert({
        where: {
            nama_userId: { // Menggunakan index unik yang baru
                nama: 'jam_lembur_minggu',
                userId: user.id
            }
        },
        update: {},
        create: {
            nama: 'jam_lembur_minggu',
            nilai: '4',
            deskripsi: 'Jumlah jam default yang ditambahkan untuk kerja di hari Minggu.',
            userId: user.id,
        }
    });
    console.log(`Pengaturan default dibuat untuk user: ${user.username}`);
  }

  console.log('Proses seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
