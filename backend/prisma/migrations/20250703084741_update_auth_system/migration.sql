/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `botTokenIv` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Karyawan` DROP FOREIGN KEY `Karyawan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Pengaturan` DROP FOREIGN KEY `Pengaturan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TipeGaji` DROP FOREIGN KEY `TipeGaji_userId_fkey`;

-- DropIndex
DROP INDEX `Karyawan_userId_fkey` ON `Karyawan`;

-- DropIndex
DROP INDEX `Pengaturan_userId_fkey` ON `Pengaturan`;

-- DropIndex
DROP INDEX `TipeGaji_userId_fkey` ON `TipeGaji`;

-- DropIndex
DROP INDEX `User_botToken_key` ON `User`;

-- DropIndex
DROP INDEX `User_username_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `username`,
    ADD COLUMN `botTokenIv` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
    ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `password` TEXT NOT NULL,
    MODIFY `botToken` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengaturan` ADD CONSTRAINT `Pengaturan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipeGaji` ADD CONSTRAINT `TipeGaji_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
