/*
  Warnings:

  - You are about to drop the `ServiceTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceTags" DROP CONSTRAINT "ServiceTags_service_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceTags" DROP CONSTRAINT "ServiceTags_tag_id_fkey";

-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "admin_approved_id" UUID,
ADD COLUMN     "admin_frozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approved_at" TIMESTAMPTZ,
ADD COLUMN     "buyer_instructions" TEXT,
ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "owner_frozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skills" TEXT[];

-- DropTable
DROP TABLE "ServiceTags";

-- CreateTable
CREATE TABLE "ServicePurchases" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "purchased_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_accepted" BOOLEAN NOT NULL DEFAULT false,
    "owner_decision_at" TIMESTAMPTZ,
    "owner_rejected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ServicePurchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePurchaseDeliverables" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "description" TEXT,
    "delivery_date" TIMESTAMPTZ,
    "is_delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivery_done_at" TIMESTAMPTZ,
    "comment" TEXT,
    "buyer_accepted" BOOLEAN NOT NULL DEFAULT false,
    "accepted_at" TIMESTAMPTZ,

    CONSTRAINT "ServicePurchaseDeliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePurchaseAttachments" (
    "id" UUID NOT NULL,
    "deliverable_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicePurchaseAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServicePurchases_service_id_idx" ON "ServicePurchases"("service_id");

-- CreateIndex
CREATE INDEX "ServicePurchases_buyer_id_idx" ON "ServicePurchases"("buyer_id");

-- CreateIndex
CREATE INDEX "ServicePurchases_purchased_at_idx" ON "ServicePurchases"("purchased_at");

-- CreateIndex
CREATE INDEX "ServicePurchases_owner_accepted_idx" ON "ServicePurchases"("owner_accepted");

-- CreateIndex
CREATE INDEX "ServicePurchases_owner_rejected_idx" ON "ServicePurchases"("owner_rejected");

-- CreateIndex
CREATE INDEX "ServicePurchaseDeliverables_purchase_id_idx" ON "ServicePurchaseDeliverables"("purchase_id");

-- CreateIndex
CREATE INDEX "ServicePurchaseAttachments_deliverable_id_idx" ON "ServicePurchaseAttachments"("deliverable_id");

-- CreateIndex
CREATE INDEX "Services_admin_approved_id_idx" ON "Services"("admin_approved_id");

-- CreateIndex
CREATE INDEX "Services_owner_frozen_idx" ON "Services"("owner_frozen");

-- CreateIndex
CREATE INDEX "Services_admin_frozen_idx" ON "Services"("admin_frozen");

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_admin_approved_id_fkey" FOREIGN KEY ("admin_approved_id") REFERENCES "Admins"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePurchases" ADD CONSTRAINT "ServicePurchases_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePurchases" ADD CONSTRAINT "ServicePurchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePurchaseDeliverables" ADD CONSTRAINT "ServicePurchaseDeliverables_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "ServicePurchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePurchaseAttachments" ADD CONSTRAINT "ServicePurchaseAttachments_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "ServicePurchaseDeliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
