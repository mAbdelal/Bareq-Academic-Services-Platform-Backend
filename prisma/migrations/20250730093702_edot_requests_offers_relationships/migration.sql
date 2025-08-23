/*
  Warnings:

  - You are about to drop the `_RequestOffers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[custom_request_id,provider_id]` on the table `CustomRequestOffers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accepted_offer_id]` on the table `CustomRequests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_RequestOffers" DROP CONSTRAINT "_RequestOffers_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestOffers" DROP CONSTRAINT "_RequestOffers_B_fkey";

-- DropIndex
DROP INDEX "CustomRequestOffers_custom_request_id_idx";

-- DropIndex
DROP INDEX "CustomRequestOffers_custom_request_id_key";

-- DropTable
DROP TABLE "_RequestOffers";

-- CreateIndex
CREATE UNIQUE INDEX "CustomRequestOffers_custom_request_id_provider_id_key" ON "CustomRequestOffers"("custom_request_id", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRequests_accepted_offer_id_key" ON "CustomRequests"("accepted_offer_id");

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_accepted_offer_id_fkey" FOREIGN KEY ("accepted_offer_id") REFERENCES "CustomRequestOffers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
