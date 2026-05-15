/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `concepts` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE UNIQUE INDEX "concepts_order_key" ON "concepts"("order");
