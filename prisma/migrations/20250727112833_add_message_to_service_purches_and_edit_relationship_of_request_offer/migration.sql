-- DropForeignKey
ALTER TABLE "CustomRequestOffers" DROP CONSTRAINT "CustomRequestOffers_id_fkey";

-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" ADD COLUMN     "message" TEXT;

-- AddForeignKey
ALTER TABLE "OffersAttachments" ADD CONSTRAINT "OffersAttachments_id_fkey" FOREIGN KEY ("id") REFERENCES "CustomRequestOffers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
