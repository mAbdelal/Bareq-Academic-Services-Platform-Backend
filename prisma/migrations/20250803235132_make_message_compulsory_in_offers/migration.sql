/*
  Warnings:

  - Made the column `message` on table `CustomRequestOffers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CustomRequestOffers" ALTER COLUMN "message" SET NOT NULL;
