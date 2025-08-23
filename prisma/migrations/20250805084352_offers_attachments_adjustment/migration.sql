/*
  Warnings:

  - You are about to drop the column `filename` on the `OffersAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `mimetype` on the `OffersAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `OffersAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `OffersAttachments` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `OffersAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `OffersAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `OffersAttachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OffersAttachments" DROP COLUMN "filename",
DROP COLUMN "mimetype",
DROP COLUMN "size",
DROP COLUMN "url",
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_type" "FileType" NOT NULL,
ADD COLUMN     "file_url" TEXT NOT NULL;
