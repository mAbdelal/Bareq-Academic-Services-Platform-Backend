/*
  Warnings:

  - The values [purchase,admin_adjustment] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('deposit', 'withdrawal', 'service_payment', 'custom_request_payment', 'dispute_resolution');
ALTER TABLE "Transactions" ALTER COLUMN "reason" TYPE "TransactionReason_new" USING ("reason"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "TransactionReason_old";
COMMIT;
