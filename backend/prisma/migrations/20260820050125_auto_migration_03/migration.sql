/*
  Warnings:

  - You are about to drop the column `ifsccode` on the `branch` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "branch_ifsccode_idx";

-- DropIndex
DROP INDEX "branch_ifsccode_key";

-- AlterTable
ALTER TABLE "branch" DROP COLUMN "ifsccode";
