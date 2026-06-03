/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `concepts` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `study_cases` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `test_cases` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "concepts" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "study_cases" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "test_cases" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "deleted_at";
