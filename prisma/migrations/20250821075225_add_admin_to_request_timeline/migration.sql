/*
  Warnings:

  - Changed the type of `file_type` on the `ServicePurchaseAttachments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "RequestImplementationRole" ADD VALUE 'admin';

-- AlterTable
ALTER TABLE "ServicePurchaseAttachments" DROP COLUMN "file_type",
ADD COLUMN     "file_type" "FileType" NOT NULL;
