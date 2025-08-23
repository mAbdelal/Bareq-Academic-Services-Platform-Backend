-- DropForeignKey
ALTER TABLE "OffersAttachments" DROP CONSTRAINT "OffersAttachments_id_fkey";

-- DropIndex
DROP INDEX "OffersAttachments_offer_id_key";

-- AddForeignKey
ALTER TABLE "OffersAttachments" ADD CONSTRAINT "OffersAttachments_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "CustomRequestOffers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
