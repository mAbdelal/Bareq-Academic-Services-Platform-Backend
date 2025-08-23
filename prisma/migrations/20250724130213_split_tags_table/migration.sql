/*
  Warnings:

  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomRequestTags" DROP CONSTRAINT "CustomRequestTags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "ServiceTags" DROP CONSTRAINT "ServiceTags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "Tags" DROP CONSTRAINT "Tags_academic_subcategory_id_fkey";

-- DropTable
DROP TABLE "Tags";

-- CreateTable
CREATE TABLE "AcademicTags" (
    "id" SERIAL NOT NULL,
    "type" "TagType" NOT NULL DEFAULT 'academic',
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "academic_subcategory_id" INTEGER NOT NULL,
    "is_system_defined" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialTags" (
    "id" SERIAL NOT NULL,
    "type" "TagType" NOT NULL DEFAULT 'custom',
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "is_system_defined" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MaterialTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicTags_academic_subcategory_id_name_ar_key" ON "AcademicTags"("academic_subcategory_id", "name_ar");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialTags_name_ar_key" ON "MaterialTags"("name_ar");

-- AddForeignKey
ALTER TABLE "AcademicTags" ADD CONSTRAINT "AcademicTags_academic_subcategory_id_fkey" FOREIGN KEY ("academic_subcategory_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTags" ADD CONSTRAINT "ServiceTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "MaterialTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestTags" ADD CONSTRAINT "CustomRequestTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "MaterialTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
