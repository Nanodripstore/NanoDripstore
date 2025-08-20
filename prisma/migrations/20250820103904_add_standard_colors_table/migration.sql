/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId,variant_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cart_items_userId_productId_color_size_key";

-- CreateTable
CREATE TABLE "standard_colors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hex_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'basic',

    CONSTRAINT "standard_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standard_colors_name_key" ON "standard_colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "standard_colors_hex_code_key" ON "standard_colors"("hex_code");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_variant_id_key" ON "cart_items"("userId", "productId", "variant_id");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
