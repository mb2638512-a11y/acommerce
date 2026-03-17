-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "idDocumentUrl" TEXT,
    "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "paypalPayerId" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "themeColor" TEXT DEFAULT 'indigo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "settings" TEXT,
    CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "items" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "costPerItem" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "barcode" TEXT,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isDigital" BOOLEAN NOT NULL DEFAULT false,
    "variants" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "shipping" REAL NOT NULL,
    "discount" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
    "timeline" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "lastOrderDate" DATETIME,
    "notes" TEXT,
    "tags" TEXT,
    "wishlist" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "customerName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscriber_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "DiscountCode_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "lastMessage" TEXT,
    "unreadAdmin" INTEGER NOT NULL DEFAULT 0,
    "unreadUser" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "permissions" TEXT,
    "lastUsed" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SellerAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" REAL NOT NULL DEFAULT 0.05,
    "planTier" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SellerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "sellerPayout" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripeTransferId" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "Commission_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSetting_key_key" ON "GlobalSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SellerAccount_stripeAccountId_key" ON "SellerAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "SellerAccount_userId_idx" ON "SellerAccount"("userId");

-- CreateIndex
CREATE INDEX "Commission_sellerId_idx" ON "Commission"("sellerId");

-- CreateIndex
CREATE INDEX "Commission_orderId_idx" ON "Commission"("orderId");
