/*
  Warnings:

  - You are about to drop the column `deliverables` on the `Services` table. All the data in the column will be lost.
  - You are about to drop the column `revisions` on the `Services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Services" DROP COLUMN "deliverables",
DROP COLUMN "revisions";
