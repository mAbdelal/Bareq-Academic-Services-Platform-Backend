-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestImplementationAction" ADD VALUE 'AdminRefundBuyer';
ALTER TYPE "RequestImplementationAction" ADD VALUE 'AdminPayProvider';
ALTER TYPE "RequestImplementationAction" ADD VALUE 'AdminSplitPayment';
ALTER TYPE "RequestImplementationAction" ADD VALUE 'AdminChargeBoth';
ALTER TYPE "RequestImplementationAction" ADD VALUE 'AdminAskRedo';
