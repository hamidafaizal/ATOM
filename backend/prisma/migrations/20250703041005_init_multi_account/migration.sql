/*
  Warnings:

  - A unique constraint covering the columns `[nama,userId]` on the table `Pengaturan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Karyawan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Pengaturan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TipeGaji` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Absensi` DROP FOREIGN KEY `Absensi_karyawanId_fkey`;

-- DropIndex
DROP INDEX `Absensi_karyawanId_fkey` ON `Absensi`;

-- DropIndex
DROP INDEX `Pengaturan_nama_key` ON `Pengaturan`;

-- AlterTable
ALTER TABLE `Karyawan` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pengaturan` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `TipeGaji` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `namaPerusahaan` VARCHAR(191) NOT NULL,
    `botToken` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_botToken_key`(`botToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Pengaturan_nama_userId_key` ON `Pengaturan`(`nama`, `userId`);

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absensi` ADD CONSTRAINT `Absensi_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengaturan` ADD CONSTRAINT `Pengaturan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipeGaji` ADD CONSTRAINT `TipeGaji_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
