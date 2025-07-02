-- CreateTable
CREATE TABLE `Karyawan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegram_id` BIGINT NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Karyawan_telegram_id_key`(`telegram_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
