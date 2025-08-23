-- DropForeignKey
ALTER TABLE "AcademicUsers" DROP CONSTRAINT "AcademicUsers_user_id_fkey";

-- AddForeignKey
ALTER TABLE "UserBalances" ADD CONSTRAINT "UserBalances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
