/*
  Warnings:

  - The values [PENDING,AGREED,CANCELLED,EXPIRED] on the enum `NegotiationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NegotiationStatus_new" AS ENUM ('pending', 'agreed');
ALTER TABLE "Negotiations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Negotiations" ALTER COLUMN "status" TYPE "NegotiationStatus_new" USING ("status"::text::"NegotiationStatus_new");
ALTER TYPE "NegotiationStatus" RENAME TO "NegotiationStatus_old";
ALTER TYPE "NegotiationStatus_new" RENAME TO "NegotiationStatus";
DROP TYPE "NegotiationStatus_old";
ALTER TABLE "Negotiations" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "Negotiations" ALTER COLUMN "status" SET DEFAULT 'pending';
