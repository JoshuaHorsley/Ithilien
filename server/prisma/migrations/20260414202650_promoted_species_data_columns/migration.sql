/*
  Warnings:

  - You are about to drop the column `speciesData` on the `plant` table. All the data in the column will be lost.
  - You are about to drop the `speciescache` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `plant` DROP COLUMN `speciesData`,
    ADD COLUMN `commonName` VARCHAR(191) NULL,
    ADD COLUMN `edible` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `family` VARCHAR(191) NULL,
    ADD COLUMN `flowerColor` JSON NOT NULL,
    ADD COLUMN `foliageColor` JSON NOT NULL,
    ADD COLUMN `growthRate` VARCHAR(191) NULL,
    ADD COLUMN `humidity` VARCHAR(191) NULL,
    ADD COLUMN `light` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `toxicity` VARCHAR(191) NULL,
    ADD COLUMN `trefleId` INTEGER NULL,
    ADD COLUMN `watering` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `speciescache`;
