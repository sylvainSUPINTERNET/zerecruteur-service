/*
  Warnings:

  - You are about to drop the column `userId` on the `PaymentLink` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `PaymentLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PaymentLink" DROP CONSTRAINT "PaymentLink_userId_fkey";

-- AlterTable
ALTER TABLE "PaymentLink" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";
