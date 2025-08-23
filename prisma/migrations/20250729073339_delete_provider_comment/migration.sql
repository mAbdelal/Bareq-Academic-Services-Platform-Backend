/*
  Warnings:

  - You are about to drop the column `provider_comment` on the `RequestImplementationDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `provider_comment` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RequestImplementationDeliverables" DROP COLUMN "provider_comment";

-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" DROP COLUMN "provider_comment";
