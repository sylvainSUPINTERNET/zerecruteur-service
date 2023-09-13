/*
  Warnings:

  - Made the column `identifier` on table `PaymentLink` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentLink" ALTER COLUMN "identifier" SET NOT NULL;
