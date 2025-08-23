/*
  Warnings:

  - You are about to drop the column `service_id` on the `Chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_purchase_id]` on the table `Chats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_service_id_fkey";

-- DropIndex
DROP INDEX "Chats_service_id_idx";

-- DropIndex
DROP INDEX "Chats_service_id_key";

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "service_id",
ADD COLUMN     "service_purchase_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Chats_service_purchase_id_key" ON "Chats"("service_purchase_id");

-- CreateIndex
CREATE INDEX "Chats_service_purchase_id_idx" ON "Chats"("service_purchase_id");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_service_purchase_id_fkey" FOREIGN KEY ("service_purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
