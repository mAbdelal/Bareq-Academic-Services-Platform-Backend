/*
  Warnings:

  - You are about to drop the column `filename` on the `RequestDeliverableAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `mimetype` on the `RequestDeliverableAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `RequestDeliverableAttachments` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `RequestDeliverableAttachments` table. All the data in the column will be lost.
  - Made the column `file_name` on table `CustomRequestAttachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `file_name` on table `MessageAttachments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `file_name` to the `RequestDeliverableAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `RequestDeliverableAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `RequestDeliverableAttachments` table without a default value. This is not possible if the table is not empty.
  - Made the column `file_name` on table `ServiceAttachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `file_name` on table `ServicePurchaseAttachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `file_name` on table `WorkAttachments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CustomRequestAttachments" ALTER COLUMN "file_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "MessageAttachments" ALTER COLUMN "file_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "RequestDeliverableAttachments" DROP COLUMN "filename",
DROP COLUMN "mimetype",
DROP COLUMN "size",
DROP COLUMN "url",
ADD COLUMN     "file_name" TEXT NOT NULL,
ADD COLUMN     "file_type" TEXT NOT NULL,
ADD COLUMN     "file_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceAttachments" ALTER COLUMN "file_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "ServicePurchaseAttachments" ALTER COLUMN "file_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkAttachments" ALTER COLUMN "file_name" SET NOT NULL;
