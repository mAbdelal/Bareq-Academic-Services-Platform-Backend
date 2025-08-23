/*
  Warnings:

  - You are about to drop the column `resolution` on the `Disputes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Disputes" DROP COLUMN "resolution",
ADD COLUMN     "admin_decision_at" TIMESTAMPTZ,
ADD COLUMN     "complainant_note" TEXT,
ADD COLUMN     "resolved_by_admin_id" UUID,
ADD COLUMN     "solution" TEXT;

-- CreateIndex
CREATE INDEX "Disputes_resolved_by_admin_id_idx" ON "Disputes"("resolved_by_admin_id");

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_resolved_by_admin_id_fkey" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "Admins"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
