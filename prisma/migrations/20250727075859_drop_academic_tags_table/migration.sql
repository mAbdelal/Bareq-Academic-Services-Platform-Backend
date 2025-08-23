/*
  Warnings:

  - You are about to drop the `AcademicTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AcademicTags" DROP CONSTRAINT "AcademicTags_academic_subcategory_id_fkey";

-- DropTable
DROP TABLE "AcademicTags";
