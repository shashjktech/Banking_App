/*
  Warnings:

  - You are about to drop the column `accountId` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_accountId_fkey";

-- DropIndex
DROP INDEX "transaction_accountId_idx";

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "branchid" UUID,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "accountId",
ADD COLUMN     "fromaccountId" UUID,
ADD COLUMN     "toaccountId" UUID;

-- CreateTable
CREATE TABLE "branch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "branchcode" TEXT NOT NULL,
    "ifsccode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branch_branchcode_key" ON "branch"("branchcode");

-- CreateIndex
CREATE UNIQUE INDEX "branch_ifsccode_key" ON "branch"("ifsccode");

-- CreateIndex
CREATE INDEX "branch_branchcode_idx" ON "branch"("branchcode");

-- CreateIndex
CREATE INDEX "branch_ifsccode_idx" ON "branch"("ifsccode");

-- CreateIndex
CREATE INDEX "transaction_fromaccountId_idx" ON "transaction"("fromaccountId");

-- CreateIndex
CREATE INDEX "transaction_toaccountId_idx" ON "transaction"("toaccountId");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_branchid_fkey" FOREIGN KEY ("branchid") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_fromaccountId_fkey" FOREIGN KEY ("fromaccountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_toaccountId_fkey" FOREIGN KEY ("toaccountId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
