/*
  Warnings:

  - You are about to drop the column `custom_request_id` on the `Chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[offer_id]` on the table `Chats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_custom_request_id_fkey";

-- DropIndex
DROP INDEX "Chats_custom_request_id_idx";

-- DropIndex
DROP INDEX "Chats_custom_request_id_key";

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "custom_request_id",
ADD COLUMN     "offer_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Chats_offer_id_key" ON "Chats"("offer_id");

-- CreateIndex
CREATE INDEX "Chats_offer_id_idx" ON "Chats"("offer_id");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "CustomRequestOffers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
