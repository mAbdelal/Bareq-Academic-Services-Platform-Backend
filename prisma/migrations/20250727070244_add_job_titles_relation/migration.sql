-- CreateTable
CREATE TABLE "JobTitles" (
    "id" SERIAL NOT NULL,
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTitles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobTitles_title_ar_idx" ON "JobTitles"("title_ar");

-- CreateIndex
CREATE INDEX "JobTitles_title_en_idx" ON "JobTitles"("title_en");

-- CreateIndex
CREATE UNIQUE INDEX "JobTitles_title_ar_key" ON "JobTitles"("title_ar");
