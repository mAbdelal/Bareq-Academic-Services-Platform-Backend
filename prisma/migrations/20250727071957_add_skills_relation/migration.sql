-- CreateTable
CREATE TABLE "Skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skills_name_key" ON "Skills"("name");

-- CreateIndex
CREATE INDEX "Skills_name_idx" ON "Skills"("name");
