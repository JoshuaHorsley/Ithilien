/*
  Warnings:

  - A unique constraint covering the columns `[plantImageId]` on the table `Plant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `plant` ADD COLUMN `plantImageId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PlantImage` (
    `id` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlantImage_storageKey_key`(`storageKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Plant_plantImageId_key` ON `Plant`(`plantImageId`);

-- AddForeignKey
ALTER TABLE `Plant` ADD CONSTRAINT `Plant_plantImageId_fkey` FOREIGN KEY (`plantImageId`) REFERENCES `PlantImage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlantImage` ADD CONSTRAINT `PlantImage_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
