-- AlterTable
ALTER TABLE `Karyawan` ADD COLUMN `tipeGajiId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TipeGaji` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `model_perhitungan` VARCHAR(191) NOT NULL,
    `nilai_gaji_dasar` DOUBLE NULL,
    `potongan_tidak_masuk` DOUBLE NULL,
    `tarif_lembur_per_jam` DOUBLE NULL,
    `aturan_tarif_per_jam` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_tipeGajiId_fkey` FOREIGN KEY (`tipeGajiId`) REFERENCES `TipeGaji`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
