/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `study_cases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `study_cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "study_cases" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "study_cases_slug_key" ON "study_cases"("slug");
