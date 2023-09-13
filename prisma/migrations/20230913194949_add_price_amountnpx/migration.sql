/*
  Warnings:

  - You are about to drop the column `price` on the `Price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Price" DROP COLUMN "price",
ADD COLUMN     "amount" INTEGER;
