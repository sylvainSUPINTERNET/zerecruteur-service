/*
  Warnings:

  - Added the required column `amount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceStripeId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "priceStripeId" TEXT NOT NULL;
