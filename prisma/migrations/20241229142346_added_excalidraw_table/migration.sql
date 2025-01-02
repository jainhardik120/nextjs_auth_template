-- CreateTable
CREATE TABLE "ExcalidrawDiagrams" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExcalidrawDiagrams_pkey" PRIMARY KEY ("id")
);
