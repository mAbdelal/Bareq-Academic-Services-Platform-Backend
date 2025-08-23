/*
  Warnings:

  - The values [provider_accepted] on the enum `ServicePurchaseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServicePurchaseStatus_new" AS ENUM ('pending', 'provider_rejected', 'in_progress', 'submitted', 'disputed_by_provider', 'disputed_by_buyer', 'completed', 'buyer_rejected');
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" TYPE "ServicePurchaseStatus_new" USING ("status"::text::"ServicePurchaseStatus_new");
ALTER TYPE "ServicePurchaseStatus" RENAME TO "ServicePurchaseStatus_old";
ALTER TYPE "ServicePurchaseStatus_new" RENAME TO "ServicePurchaseStatus";
DROP TYPE "ServicePurchaseStatus_old";
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
