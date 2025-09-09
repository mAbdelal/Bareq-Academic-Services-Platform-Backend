/*
  Warnings:

  - You are about to drop the column `admin_approved_id` on the `Services` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `Services` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('pending', 'approved', 'disapproved');

-- DropForeignKey
ALTER TABLE "Services" DROP CONSTRAINT "Services_admin_approved_id_fkey";

-- DropIndex
DROP INDEX "Services_admin_approved_id_idx";

-- AlterTable
ALTER TABLE "Services" DROP COLUMN "admin_approved_id",
DROP COLUMN "approved_at",
ADD COLUMN     "admin_approval_status" "AdminApprovalStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "admin_decided_id" UUID,
ADD COLUMN     "admin_decision_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Services_admin_decided_id_idx" ON "Services"("admin_decided_id");

-- CreateIndex
CREATE INDEX "Services_admin_approval_status_idx" ON "Services"("admin_approval_status");

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_admin_decided_id_fkey" FOREIGN KEY ("admin_decided_id") REFERENCES "Admins"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
