/*
  Warnings:

  - The `academic_status` column on the `AcademicUsers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('high_school_student', 'high_school_graduate', 'bachelor_student', 'bachelor', 'master_student', 'master', 'phd_candidate', 'phd', 'alumni', 'researcher', 'other');

-- AlterTable
ALTER TABLE "AcademicUsers" DROP COLUMN "academic_status",
ADD COLUMN     "academic_status" "AcademicStatus";

-- DropEnum
DROP TYPE "TagType";
