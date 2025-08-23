/*
  Warnings:

  - The values [rejected,cancelled] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [rejected,cancelled] on the enum `ServicePurchaseStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `branch_id` on the `CustomRequests` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `CustomRequests` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_at` on the `RequestImplementationDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `offer_id` on the `RequestImplementationDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_at` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `buyer_accepted` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_date` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `owner_accepted` on the `ServicePurchases` table. All the data in the column will be lost.
  - You are about to drop the column `owner_decision_at` on the `ServicePurchases` table. All the data in the column will be lost.
  - You are about to drop the column `purchased_at` on the `ServicePurchases` table. All the data in the column will be lost.
  - Added the required column `academic_category_id` to the `CustomRequests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServicePurchaseRole" AS ENUM ('buyer', 'provider');

-- CreateEnum
CREATE TYPE "RequestImplementationRole" AS ENUM ('owner', 'provider');

-- CreateEnum
CREATE TYPE "ServicePurchaseAction" AS ENUM ('purchase', 'Provider_accept', 'Provider_reject', 'submit', 'dispute_provider', 'dispute_buyer', 'buyer_reject', 'complete');

-- CreateEnum
CREATE TYPE "RequestImplementationAction" AS ENUM ('request_created', 'offer_accepted', 'submit', 'dispute_provider', 'dispute_owner', 'owner_rejected', 'complete');

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('open', 'in_progress', 'submitted', 'disputed_by_provider', 'disputed_by_owner', 'owner_rejected', 'completed');
ALTER TABLE "CustomRequests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CustomRequests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "CustomRequests" ALTER COLUMN "status" SET DEFAULT 'open';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServicePurchaseStatus_new" AS ENUM ('pending', 'provider_accepted', 'provider_rejected', 'in_progress', 'submitted', 'disputed_by_provider', 'disputed_by_buyer', 'completed', 'buyer_rejected');
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" TYPE "ServicePurchaseStatus_new" USING ("status"::text::"ServicePurchaseStatus_new");
ALTER TYPE "ServicePurchaseStatus" RENAME TO "ServicePurchaseStatus_old";
ALTER TYPE "ServicePurchaseStatus_new" RENAME TO "ServicePurchaseStatus";
DROP TYPE "ServicePurchaseStatus_old";
ALTER TABLE "ServicePurchases" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "CustomRequests" DROP CONSTRAINT "CustomRequests_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomRequests" DROP CONSTRAINT "CustomRequests_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "RequestImplementationDeliverables" DROP CONSTRAINT "RequestImplementationDeliverables_offer_id_fkey";

-- DropIndex
DROP INDEX "CustomRequests_branch_id_idx";

-- DropIndex
DROP INDEX "CustomRequests_subject_id_idx";

-- DropIndex
DROP INDEX "RequestImplementationDeliverables_offer_id_idx";

-- DropIndex
DROP INDEX "ServicePurchases_owner_accepted_idx";

-- DropIndex
DROP INDEX "ServicePurchases_purchased_at_idx";

-- AlterTable
ALTER TABLE "CustomRequests" DROP COLUMN "branch_id",
DROP COLUMN "subject_id",
ADD COLUMN     "academic_category_id" INTEGER NOT NULL,
ADD COLUMN     "academic_subcategory_id" INTEGER;

-- AlterTable
ALTER TABLE "RequestImplementationDeliverables" DROP COLUMN "accepted_at",
DROP COLUMN "offer_id",
ADD COLUMN     "decision_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" DROP COLUMN "accepted_at",
DROP COLUMN "buyer_accepted",
DROP COLUMN "delivery_date",
DROP COLUMN "description",
ADD COLUMN     "decision_at" TIMESTAMPTZ,
ADD COLUMN     "delivered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_accepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ServicePurchases" DROP COLUMN "owner_accepted",
DROP COLUMN "owner_decision_at",
DROP COLUMN "purchased_at";

-- CreateTable
CREATE TABLE "PurchaseTimeline" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "actor_role" "ServicePurchaseRole" NOT NULL,
    "action" "ServicePurchaseAction" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequestTimeline" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "actor_role" "RequestImplementationRole" NOT NULL,
    "action" "RequestImplementationAction" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequestTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseTimeline_purchase_id_idx" ON "PurchaseTimeline"("purchase_id");

-- CreateIndex
CREATE INDEX "PurchaseTimeline_purchase_id_action_idx" ON "PurchaseTimeline"("purchase_id", "action");

-- CreateIndex
CREATE INDEX "CustomRequestTimeline_request_id_idx" ON "CustomRequestTimeline"("request_id");

-- CreateIndex
CREATE INDEX "CustomRequestTimeline_request_id_action_idx" ON "CustomRequestTimeline"("request_id", "action");

-- CreateIndex
CREATE INDEX "CustomRequests_academic_category_id_idx" ON "CustomRequests"("academic_category_id");

-- CreateIndex
CREATE INDEX "CustomRequests_academic_subcategory_id_idx" ON "CustomRequests"("academic_subcategory_id");

-- AddForeignKey
ALTER TABLE "PurchaseTimeline" ADD CONSTRAINT "PurchaseTimeline_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_academic_category_id_fkey" FOREIGN KEY ("academic_category_id") REFERENCES "AcademicCategorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_academic_subcategory_id_fkey" FOREIGN KEY ("academic_subcategory_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestTimeline" ADD CONSTRAINT "CustomRequestTimeline_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
