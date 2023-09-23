-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCity" TEXT NOT NULL DEFAULT 'Paris',
ADD COLUMN     "shippingCountry" TEXT NOT NULL DEFAULT 'FR',
ADD COLUMN     "shippingLine1" TEXT NOT NULL DEFAULT '1 rue de Rivoli',
ADD COLUMN     "shippingLine2" TEXT DEFAULT 'Appartement 1',
ADD COLUMN     "shippingName" TEXT NOT NULL DEFAULT 'Jean Dupont',
ADD COLUMN     "shippingPostalCode" TEXT NOT NULL DEFAULT '75001',
ADD COLUMN     "shippingState" TEXT NOT NULL DEFAULT 'Ile de France';
