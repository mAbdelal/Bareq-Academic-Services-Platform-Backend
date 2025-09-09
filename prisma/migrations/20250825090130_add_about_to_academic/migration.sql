-- AlterTable
ALTER TABLE "AcademicUsers" ADD COLUMN     "about" TEXT;

-- AlterTable
ALTER TABLE "Messages" ALTER COLUMN "content" DROP NOT NULL;
