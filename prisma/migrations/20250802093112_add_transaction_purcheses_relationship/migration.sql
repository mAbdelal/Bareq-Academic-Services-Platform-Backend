/*
  Warnings:

  - You are about to drop the column `related_custom_request_id` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `related_service_id` on the `Transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_purchase_id]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[custom_request_id]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_related_custom_request_id_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_related_service_id_fkey";

-- DropIndex
DROP INDEX "Transactions_related_custom_request_id_idx";

-- DropIndex
DROP INDEX "Transactions_related_service_id_idx";

-- DropIndex
DROP INDEX "Transactions_related_service_id_key";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "related_custom_request_id",
DROP COLUMN "related_service_id",
ADD COLUMN     "custom_request_id" UUID,
ADD COLUMN     "service_purchase_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_service_purchase_id_key" ON "Transactions"("service_purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_custom_request_id_key" ON "Transactions"("custom_request_id");

-- CreateIndex
CREATE INDEX "Transactions_service_purchase_id_idx" ON "Transactions"("service_purchase_id");

-- CreateIndex
CREATE INDEX "Transactions_custom_request_id_idx" ON "Transactions"("custom_request_id");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_service_purchase_id_fkey" FOREIGN KEY ("service_purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
