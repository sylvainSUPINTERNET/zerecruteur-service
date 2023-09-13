/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `PaymentLink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentLink" ADD COLUMN     "identifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_identifier_key" ON "PaymentLink"("identifier");
