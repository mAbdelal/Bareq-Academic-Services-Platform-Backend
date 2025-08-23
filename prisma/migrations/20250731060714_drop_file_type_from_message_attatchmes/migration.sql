/*
  Warnings:

  - You are about to drop the column `file_type` on the `MessageAttachments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MessageAttachments" DROP COLUMN "file_type";
