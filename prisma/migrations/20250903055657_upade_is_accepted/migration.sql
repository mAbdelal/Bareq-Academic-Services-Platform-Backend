-- AlterTable
ALTER TABLE "RequestImplementationDeliverables" ALTER COLUMN "is_accepted" DROP NOT NULL,
ALTER COLUMN "is_accepted" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServicePurchaseDeliverables" ALTER COLUMN "is_accepted" DROP NOT NULL,
ALTER COLUMN "is_accepted" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Services" ALTER COLUMN "delivery_time_days" DROP NOT NULL,
ALTER COLUMN "delivery_time_days" SET DEFAULT 0;
