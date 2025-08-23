/*
  Warnings:

  - You are about to drop the column `delivery_done_at` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `is_delivered` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - Made the column `delivery_date` on table `ServicePurchaseDeliverables` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" DROP COLUMN "delivery_done_at",
DROP COLUMN "is_delivered",
ALTER COLUMN "delivery_date" SET NOT NULL,
ALTER COLUMN "delivery_date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ServicePurchases" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
