/*
  Warnings:

  - Made the column `syntax_rules` on table `exercises` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "exercises" ALTER COLUMN "syntax_rules" SET NOT NULL;
