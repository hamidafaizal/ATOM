-- CreateTable
CREATE TABLE `Pengaturan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `nilai` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,

    UNIQUE INDEX `Pengaturan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
