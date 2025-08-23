/*
  Warnings:

  - The values [pending,accepted] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deadline` on the `CustomRequests` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `CustomRequests` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `ServicePurchaseDeliverables` table. All the data in the column will be lost.
  - You are about to drop the column `owner_rejected` on the `ServicePurchases` table. All the data in the column will be lost.
  - You are about to drop the `CustomRequestTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialTags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expected_delivery_days` to the `CustomRequests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServicePurchaseStatus" AS ENUM ('pending', 'in_progress', 'submitted', 'completed', 'rejected', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('open', 'in_progress', 'submitted', 'completed', 'rejected', 'cancelled');
ALTER TABLE "CustomRequests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CustomRequestTags" DROP CONSTRAINT "CustomRequestTags_custom_request_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomRequestTags" DROP CONSTRAINT "CustomRequestTags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "CustomRequests" DROP CONSTRAINT "CustomRequests_provider_id_fkey";

-- DropIndex
DROP INDEX "CustomRequests_deadline_idx";

-- DropIndex
DROP INDEX "CustomRequests_provider_id_idx";

-- DropIndex
DROP INDEX "ServicePurchases_owner_rejected_idx";

-- AlterTable
ALTER TABLE "CustomRequests" DROP COLUMN "deadline",
DROP COLUMN "provider_id",
ADD COLUMN     "accepted_offer_id" UUID,
ADD COLUMN     "expected_delivery_days" INTEGER NOT NULL,
ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" DROP COLUMN "comment",
ADD COLUMN     "buyer_comment" TEXT,
ADD COLUMN     "provider_comment" TEXT;

-- AlterTable
ALTER TABLE "ServicePurchases" DROP COLUMN "owner_rejected",
ADD COLUMN     "status" "ServicePurchaseStatus" NOT NULL DEFAULT 'pending';

-- DropTable
DROP TABLE "CustomRequestTags";

-- DropTable
DROP TABLE "MaterialTags";

-- CreateTable
CREATE TABLE "CustomRequestOffers" (
    "id" UUID NOT NULL,
    "custom_request_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "delivery_days" INTEGER NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequestOffers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffersAttachments" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OffersAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestImplementationDeliverables" (
    "id" UUID NOT NULL,
    "custom_request_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "message" TEXT,
    "delivered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "accepted_at" TIMESTAMPTZ,
    "requester_comment" TEXT,
    "provider_comment" TEXT,

    CONSTRAINT "RequestImplementationDeliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDeliverableAttachments" (
    "id" UUID NOT NULL,
    "deliverable_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestDeliverableAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Works" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,
    "achievement_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RequestOffers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RequestOffers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomRequestOffers_custom_request_id_key" ON "CustomRequestOffers"("custom_request_id");

-- CreateIndex
CREATE INDEX "CustomRequestOffers_custom_request_id_idx" ON "CustomRequestOffers"("custom_request_id");

-- CreateIndex
CREATE INDEX "CustomRequestOffers_provider_id_idx" ON "CustomRequestOffers"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "OffersAttachments_offer_id_key" ON "OffersAttachments"("offer_id");

-- CreateIndex
CREATE INDEX "RequestImplementationDeliverables_custom_request_id_idx" ON "RequestImplementationDeliverables"("custom_request_id");

-- CreateIndex
CREATE INDEX "RequestImplementationDeliverables_offer_id_idx" ON "RequestImplementationDeliverables"("offer_id");

-- CreateIndex
CREATE INDEX "RequestImplementationDeliverables_delivered_at_idx" ON "RequestImplementationDeliverables"("delivered_at");

-- CreateIndex
CREATE INDEX "RequestImplementationDeliverables_is_accepted_idx" ON "RequestImplementationDeliverables"("is_accepted");

-- CreateIndex
CREATE INDEX "RequestDeliverableAttachments_deliverable_id_idx" ON "RequestDeliverableAttachments"("deliverable_id");

-- CreateIndex
CREATE INDEX "Works_user_id_idx" ON "Works"("user_id");

-- CreateIndex
CREATE INDEX "Works_category_id_idx" ON "Works"("category_id");

-- CreateIndex
CREATE INDEX "Works_subcategory_id_idx" ON "Works"("subcategory_id");

-- CreateIndex
CREATE INDEX "Works_achievement_date_idx" ON "Works"("achievement_date");

-- CreateIndex
CREATE INDEX "_RequestOffers_B_index" ON "_RequestOffers"("B");

-- CreateIndex
CREATE INDEX "CustomRequests_accepted_offer_id_idx" ON "CustomRequests"("accepted_offer_id");

-- CreateIndex
CREATE INDEX "CustomRequests_expected_delivery_days_idx" ON "CustomRequests"("expected_delivery_days");

-- AddForeignKey
ALTER TABLE "CustomRequestOffers" ADD CONSTRAINT "CustomRequestOffers_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestOffers" ADD CONSTRAINT "CustomRequestOffers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestOffers" ADD CONSTRAINT "CustomRequestOffers_id_fkey" FOREIGN KEY ("id") REFERENCES "OffersAttachments"("offer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestImplementationDeliverables" ADD CONSTRAINT "RequestImplementationDeliverables_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestImplementationDeliverables" ADD CONSTRAINT "RequestImplementationDeliverables_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "CustomRequestOffers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDeliverableAttachments" ADD CONSTRAINT "RequestDeliverableAttachments_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "RequestImplementationDeliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AcademicUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "AcademicCategorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Works" ADD CONSTRAINT "Works_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestOffers" ADD CONSTRAINT "_RequestOffers_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomRequestOffers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestOffers" ADD CONSTRAINT "_RequestOffers_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
