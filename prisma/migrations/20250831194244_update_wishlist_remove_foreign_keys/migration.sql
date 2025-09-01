/*
  Warnings:

  - Added the required column `image` to the `wishlist_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `wishlist_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `wishlist_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `wishlist_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_productId_fkey";

-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "category" TEXT,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
