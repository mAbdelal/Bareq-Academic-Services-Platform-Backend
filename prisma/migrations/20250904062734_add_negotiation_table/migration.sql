/*
  Warnings:

  - A unique constraint covering the columns `[negotiation_id]` on the table `Chats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_part_id` to the `Chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_part_id` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('PENDING', 'AGREED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Chats" ADD COLUMN     "first_part_id" UUID NOT NULL,
ADD COLUMN     "negotiation_id" UUID,
ADD COLUMN     "second_part_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Negotiations" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chats_negotiation_id_key" ON "Chats"("negotiation_id");

-- CreateIndex
CREATE INDEX "Chats_negotiation_id_idx" ON "Chats"("negotiation_id");

-- CreateIndex
CREATE INDEX "Chats_first_part_id_idx" ON "Chats"("first_part_id");

-- CreateIndex
CREATE INDEX "Chats_second_part_id_idx" ON "Chats"("second_part_id");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "Negotiations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_first_part_id_fkey" FOREIGN KEY ("first_part_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_second_part_id_fkey" FOREIGN KEY ("second_part_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiations" ADD CONSTRAINT "Negotiations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiations" ADD CONSTRAINT "Negotiations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negotiations" ADD CONSTRAINT "Negotiations_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
