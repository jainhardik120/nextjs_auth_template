-- CreateTable
CREATE TABLE "CanvaExportJob" (
    "exportId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "urls" TEXT[],

    CONSTRAINT "CanvaExportJob_pkey" PRIMARY KEY ("exportId")
);
