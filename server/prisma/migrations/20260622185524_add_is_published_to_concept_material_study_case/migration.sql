/*
  Warnings:

  - You are about to drop the column `is_unlocked` on the `concept_progresses` table. All the data in the column will be lost.
  - You are about to drop the column `is_unlocked` on the `material_progresses` table. All the data in the column will be lost.
  - You are about to drop the column `is_unlocked` on the `study_case_progresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "concept_progresses" DROP COLUMN "is_unlocked";

-- AlterTable
ALTER TABLE "concepts" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "material_progresses" DROP COLUMN "is_unlocked";

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "study_case_progresses" DROP COLUMN "is_unlocked";

-- AlterTable
ALTER TABLE "study_cases" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;
