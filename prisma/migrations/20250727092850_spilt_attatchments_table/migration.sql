/*
  Warnings:

  - You are about to drop the `Attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachments" DROP CONSTRAINT "Attachments_custom_request_id_fkey";

-- DropForeignKey
ALTER TABLE "Attachments" DROP CONSTRAINT "Attachments_service_id_fkey";

-- AlterTable
ALTER TABLE "Disputes" ALTER COLUMN "status" SET DEFAULT 'open';

-- DropTable
DROP TABLE "Attachments";

-- CreateTable
CREATE TABLE "WorkAttachments" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" "FileType" NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAttachments" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" "FileType" NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequestAttachments" (
    "id" UUID NOT NULL,
    "custom_request_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" "FileType" NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequestAttachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkAttachments" ADD CONSTRAINT "WorkAttachments_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "Works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAttachments" ADD CONSTRAINT "ServiceAttachments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestAttachments" ADD CONSTRAINT "CustomRequestAttachments_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
