/*
  Warnings:

  - You are about to drop the column `paymentLink` on the `PaymentLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentLink" DROP COLUMN "paymentLink",
ADD COLUMN     "paymentUrl" TEXT NOT NULL DEFAULT 'https://pay.stripe.com/direct/ACn3JZ3Zq5Qq0QXfX2';
