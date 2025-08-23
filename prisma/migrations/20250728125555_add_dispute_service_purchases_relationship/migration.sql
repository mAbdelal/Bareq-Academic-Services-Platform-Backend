/*
  Warnings:

  - You are about to drop the column `service_id` on the `Disputes` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `Services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_purchase_id]` on the table `Disputes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Disputes" DROP CONSTRAINT "Disputes_service_id_fkey";

-- DropIndex
DROP INDEX "Disputes_service_id_idx";

-- DropIndex
DROP INDEX "Disputes_service_id_key";

-- DropIndex
DROP INDEX "Services_transaction_id_key";

-- AlterTable
ALTER TABLE "Disputes" DROP COLUMN "service_id",
ADD COLUMN     "service_purchase_id" UUID;

-- AlterTable
ALTER TABLE "Services" DROP COLUMN "transaction_id";

-- CreateIndex
CREATE UNIQUE INDEX "Disputes_service_purchase_id_key" ON "Disputes"("service_purchase_id");

-- CreateIndex
CREATE INDEX "Disputes_service_purchase_id_idx" ON "Disputes"("service_purchase_id");

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_service_purchase_id_fkey" FOREIGN KEY ("service_purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
