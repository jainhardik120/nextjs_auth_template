-- CreateTable
CREATE TABLE "CanvaSessionState" (
    "sessionId" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvaSessionState_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "CanvaUserToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "CanvaUserToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CanvaSessionState" ADD CONSTRAINT "CanvaSessionState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvaUserToken" ADD CONSTRAINT "CanvaUserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
