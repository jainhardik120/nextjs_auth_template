/*
  Warnings:

  - Changed the type of `status` on the `CanvaExportJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CanvaJobStatus" AS ENUM ('IN_PROGRESS', 'SUCCESS');

-- AlterTable
ALTER TABLE "CanvaExportJob" DROP COLUMN "status",
ADD COLUMN     "status" "CanvaJobStatus" NOT NULL;
