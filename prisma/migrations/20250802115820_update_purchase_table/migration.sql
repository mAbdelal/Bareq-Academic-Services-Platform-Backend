/*
  Warnings:

  - The values [purchase,Provider_accept,Provider_reject,submit,dispute_provider,dispute_buyer,buyer_reject,complete] on the enum `ServicePurchaseAction` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `actor_id` on the `PurchaseTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `actor_role` on the `PurchaseTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_id` on the `PurchaseTimeline` table. All the data in the column will be lost.
  - Added the required column `role` to the `PurchaseTimeline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_purchase_id` to the `PurchaseTimeline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `PurchaseTimeline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServicePurchaseAction_new" AS ENUM ('Purchase', 'ProviderAccepted', 'ProviderRejected', 'Submitted', 'DisputeByProvider', 'DisputeByBuyer', 'BuyerRejected', 'Completed', 'AdminRefundBuyer', 'AdminPayProvider', 'AdminSplitPayment', 'AdminChargeBoth', 'AdminAskRedo');
ALTER TABLE "PurchaseTimeline" ALTER COLUMN "action" TYPE "ServicePurchaseAction_new" USING ("action"::text::"ServicePurchaseAction_new");
ALTER TYPE "ServicePurchaseAction" RENAME TO "ServicePurchaseAction_old";
ALTER TYPE "ServicePurchaseAction_new" RENAME TO "ServicePurchaseAction";
DROP TYPE "ServicePurchaseAction_old";
COMMIT;

-- AlterEnum
ALTER TYPE "ServicePurchaseRole" ADD VALUE 'admin';

-- DropForeignKey
ALTER TABLE "PurchaseTimeline" DROP CONSTRAINT "PurchaseTimeline_purchase_id_fkey";

-- DropIndex
DROP INDEX "PurchaseTimeline_purchase_id_action_idx";

-- DropIndex
DROP INDEX "PurchaseTimeline_purchase_id_idx";

-- AlterTable
ALTER TABLE "PurchaseTimeline" DROP COLUMN "actor_id",
DROP COLUMN "actor_role",
DROP COLUMN "purchase_id",
ADD COLUMN     "role" "ServicePurchaseRole" NOT NULL,
ADD COLUMN     "service_purchase_id" UUID NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "PurchaseTimeline_service_purchase_id_idx" ON "PurchaseTimeline"("service_purchase_id");

-- AddForeignKey
ALTER TABLE "PurchaseTimeline" ADD CONSTRAINT "PurchaseTimeline_service_purchase_id_fkey" FOREIGN KEY ("service_purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseTimeline" ADD CONSTRAINT "PurchaseTimeline_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
