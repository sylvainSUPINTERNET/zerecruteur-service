/*
  Warnings:

  - Added the required column `stripeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stripeId" TEXT NOT NULL;
