/*
  Warnings:

  - You are about to drop the column `ratee_id` on the `Ratings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ratings" DROP CONSTRAINT "Ratings_ratee_id_fkey";

-- DropIndex
DROP INDEX "Ratings_ratee_id_idx";

-- AlterTable
ALTER TABLE "Ratings" DROP COLUMN "ratee_id";
