-- CreateTable
CREATE TABLE "ModerationFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCategory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "flags" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0,
    "category" TEXT,
    "moderatorNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "productId" TEXT,
    "storeId" TEXT,
    "moderatorId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ModerationFlag_productId_idx" ON "ModerationFlag"("productId");

-- CreateIndex
CREATE INDEX "ModerationFlag_storeId_idx" ON "ModerationFlag"("storeId");

-- CreateIndex
CREATE INDEX "ModerationFlag_status_idx" ON "ModerationFlag"("status");

-- CreateIndex
CREATE INDEX "ModerationLog_productId_idx" ON "ModerationLog"("productId");

-- CreateIndex
CREATE INDEX "ModerationLog_moderatorId_idx" ON "ModerationLog"("moderatorId");
