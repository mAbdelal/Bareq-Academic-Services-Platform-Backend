-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionReason" ADD VALUE 'fund_release';
ALTER TYPE "TransactionReason" ADD VALUE 'service_income';
ALTER TYPE "TransactionReason" ADD VALUE 'custom_request_income';
ALTER TYPE "TransactionReason" ADD VALUE 'platform_commission';

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserBalances" ADD COLUMN     "frozen_balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SystemBalance" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "total_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemBalance_pkey" PRIMARY KEY ("id")
);
