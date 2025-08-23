-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('academic', 'custom');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('general', 'gallery_image', 'gallery_video', 'cover');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "TransactionReason" AS ENUM ('deposit', 'purchase', 'service_payment', 'withdrawal', 'custom_request_payment', 'admin_adjustment', 'dispute_resolution');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name_ar" TEXT NOT NULL,
    "last_name_ar" TEXT NOT NULL,
    "full_name_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admins" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "AcademicUsers" (
    "user_id" UUID NOT NULL,
    "identity_document_url" TEXT,
    "academic_status" TEXT,
    "university" TEXT,
    "faculty" TEXT,
    "major" TEXT,
    "study_start_year" INTEGER,
    "study_end_year" INTEGER,
    "job_title" TEXT,
    "skills" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "ratings_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicUsers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "AcademicCategorys" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicCategorys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSubcategorys" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicSubcategorys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "type" "TagType" NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "academic_subcategory_id" INTEGER,
    "is_system_defined" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Services" (
    "id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "academic_category_id" INTEGER NOT NULL,
    "academic_subcategory_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delivery_time_days" INTEGER NOT NULL,
    "revisions" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "ratings_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" UUID,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTags" (
    "service_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "ServiceTags_pkey" PRIMARY KEY ("service_id","tag_id")
);

-- CreateTable
CREATE TABLE "CustomRequests" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "provider_id" UUID,
    "subject_id" INTEGER NOT NULL,
    "branch_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMPTZ NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "rating_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequestTags" (
    "custom_request_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "CustomRequestTags_pkey" PRIMARY KEY ("custom_request_id","tag_id")
);

-- CreateTable
CREATE TABLE "Attachments" (
    "id" UUID NOT NULL,
    "service_id" UUID,
    "custom_request_id" UUID,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" "FileType" NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chats" (
    "id" UUID NOT NULL,
    "service_id" UUID,
    "custom_request_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachments" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ratings" (
    "id" UUID NOT NULL,
    "rater_id" UUID NOT NULL,
    "ratee_id" UUID NOT NULL,
    "service_id" UUID,
    "custom_request_id" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disputes" (
    "id" UUID NOT NULL,
    "custom_request_id" UUID,
    "service_id" UUID,
    "complainant_id" UUID NOT NULL,
    "respondent_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL,
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalances" (
    "user_id" UUID NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBalances_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "admin_id" UUID,
    "amount" DOUBLE PRECISION NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "reason" "TransactionReason" NOT NULL,
    "payment_method" TEXT,
    "related_service_id" UUID,
    "related_custom_request_id" UUID,
    "related_dispute_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_username_idx" ON "Users"("username");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_is_active_idx" ON "Users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- CreateIndex
CREATE INDEX "Roles_name_idx" ON "Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "Permissions"("name");

-- CreateIndex
CREATE INDEX "Permissions_name_idx" ON "Permissions"("name");

-- CreateIndex
CREATE INDEX "AcademicUsers_major_idx" ON "AcademicUsers"("major");

-- CreateIndex
CREATE INDEX "AcademicUsers_job_title_idx" ON "AcademicUsers"("job_title");

-- CreateIndex
CREATE INDEX "AcademicUsers_rating_idx" ON "AcademicUsers"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCategorys_name_key" ON "AcademicCategorys"("name");

-- CreateIndex
CREATE INDEX "AcademicCategorys_name_idx" ON "AcademicCategorys"("name");

-- CreateIndex
CREATE INDEX "AcademicCategorys_is_active_idx" ON "AcademicCategorys"("is_active");

-- CreateIndex
CREATE INDEX "AcademicSubcategorys_name_idx" ON "AcademicSubcategorys"("name");

-- CreateIndex
CREATE INDEX "AcademicSubcategorys_is_active_idx" ON "AcademicSubcategorys"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSubcategorys_category_id_name_key" ON "AcademicSubcategorys"("category_id", "name");

-- CreateIndex
CREATE INDEX "Tags_type_idx" ON "Tags"("type");

-- CreateIndex
CREATE INDEX "Tags_name_ar_idx" ON "Tags"("name_ar");

-- CreateIndex
CREATE INDEX "Tags_name_en_idx" ON "Tags"("name_en");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_type_academic_subcategory_id_name_ar_key" ON "Tags"("type", "academic_subcategory_id", "name_ar");

-- CreateIndex
CREATE UNIQUE INDEX "Services_transaction_id_key" ON "Services"("transaction_id");

-- CreateIndex
CREATE INDEX "Services_provider_id_idx" ON "Services"("provider_id");

-- CreateIndex
CREATE INDEX "Services_academic_subcategory_id_idx" ON "Services"("academic_subcategory_id");

-- CreateIndex
CREATE INDEX "Services_academic_category_id_idx" ON "Services"("academic_category_id");

-- CreateIndex
CREATE INDEX "Services_price_idx" ON "Services"("price");

-- CreateIndex
CREATE INDEX "Services_is_active_idx" ON "Services"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRequests_rating_id_key" ON "CustomRequests"("rating_id");

-- CreateIndex
CREATE INDEX "CustomRequests_requester_id_idx" ON "CustomRequests"("requester_id");

-- CreateIndex
CREATE INDEX "CustomRequests_provider_id_idx" ON "CustomRequests"("provider_id");

-- CreateIndex
CREATE INDEX "CustomRequests_subject_id_idx" ON "CustomRequests"("subject_id");

-- CreateIndex
CREATE INDEX "CustomRequests_branch_id_idx" ON "CustomRequests"("branch_id");

-- CreateIndex
CREATE INDEX "CustomRequests_status_idx" ON "CustomRequests"("status");

-- CreateIndex
CREATE INDEX "CustomRequests_deadline_idx" ON "CustomRequests"("deadline");

-- CreateIndex
CREATE INDEX "Attachments_service_id_idx" ON "Attachments"("service_id");

-- CreateIndex
CREATE INDEX "Attachments_custom_request_id_idx" ON "Attachments"("custom_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chats_service_id_key" ON "Chats"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chats_custom_request_id_key" ON "Chats"("custom_request_id");

-- CreateIndex
CREATE INDEX "Chats_service_id_idx" ON "Chats"("service_id");

-- CreateIndex
CREATE INDEX "Chats_custom_request_id_idx" ON "Chats"("custom_request_id");

-- CreateIndex
CREATE INDEX "Messages_chat_id_idx" ON "Messages"("chat_id");

-- CreateIndex
CREATE INDEX "Messages_sender_id_idx" ON "Messages"("sender_id");

-- CreateIndex
CREATE INDEX "Messages_created_at_idx" ON "Messages"("created_at");

-- CreateIndex
CREATE INDEX "MessageAttachments_message_id_idx" ON "MessageAttachments"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_custom_request_id_key" ON "Ratings"("custom_request_id");

-- CreateIndex
CREATE INDEX "Ratings_rater_id_idx" ON "Ratings"("rater_id");

-- CreateIndex
CREATE INDEX "Ratings_ratee_id_idx" ON "Ratings"("ratee_id");

-- CreateIndex
CREATE INDEX "Ratings_service_id_idx" ON "Ratings"("service_id");

-- CreateIndex
CREATE INDEX "Ratings_custom_request_id_idx" ON "Ratings"("custom_request_id");

-- CreateIndex
CREATE INDEX "Ratings_rating_idx" ON "Ratings"("rating");

-- CreateIndex
CREATE INDEX "Ratings_created_at_idx" ON "Ratings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Disputes_custom_request_id_key" ON "Disputes"("custom_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "Disputes_service_id_key" ON "Disputes"("service_id");

-- CreateIndex
CREATE INDEX "Disputes_custom_request_id_idx" ON "Disputes"("custom_request_id");

-- CreateIndex
CREATE INDEX "Disputes_service_id_idx" ON "Disputes"("service_id");

-- CreateIndex
CREATE INDEX "Disputes_complainant_id_idx" ON "Disputes"("complainant_id");

-- CreateIndex
CREATE INDEX "Disputes_respondent_id_idx" ON "Disputes"("respondent_id");

-- CreateIndex
CREATE INDEX "Disputes_status_idx" ON "Disputes"("status");

-- CreateIndex
CREATE INDEX "Notifications_user_id_idx" ON "Notifications"("user_id");

-- CreateIndex
CREATE INDEX "Notifications_is_read_idx" ON "Notifications"("is_read");

-- CreateIndex
CREATE INDEX "Notifications_created_at_idx" ON "Notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_related_service_id_key" ON "Transactions"("related_service_id");

-- CreateIndex
CREATE INDEX "Transactions_user_id_idx" ON "Transactions"("user_id");

-- CreateIndex
CREATE INDEX "Transactions_admin_id_idx" ON "Transactions"("admin_id");

-- CreateIndex
CREATE INDEX "Transactions_direction_idx" ON "Transactions"("direction");

-- CreateIndex
CREATE INDEX "Transactions_reason_idx" ON "Transactions"("reason");

-- CreateIndex
CREATE INDEX "Transactions_related_service_id_idx" ON "Transactions"("related_service_id");

-- CreateIndex
CREATE INDEX "Transactions_related_custom_request_id_idx" ON "Transactions"("related_custom_request_id");

-- CreateIndex
CREATE INDEX "Transactions_related_dispute_id_idx" ON "Transactions"("related_dispute_id");

-- CreateIndex
CREATE INDEX "Transactions_created_at_idx" ON "Transactions"("created_at");

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicUsers" ADD CONSTRAINT "fk_academic_user_users" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicUsers" ADD CONSTRAINT "AcademicUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserBalances"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicSubcategorys" ADD CONSTRAINT "AcademicSubcategorys_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "AcademicCategorys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_academic_subcategory_id_fkey" FOREIGN KEY ("academic_subcategory_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "AcademicUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_academic_subcategory_id_fkey" FOREIGN KEY ("academic_subcategory_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_academic_category_id_fkey" FOREIGN KEY ("academic_category_id") REFERENCES "AcademicCategorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTags" ADD CONSTRAINT "ServiceTags_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTags" ADD CONSTRAINT "ServiceTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "AcademicUsers"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "AcademicSubcategorys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "AcademicCategorys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequests" ADD CONSTRAINT "CustomRequests_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "Ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestTags" ADD CONSTRAINT "CustomRequestTags_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestTags" ADD CONSTRAINT "CustomRequestTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachments" ADD CONSTRAINT "MessageAttachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_ratee_id_fkey" FOREIGN KEY ("ratee_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_custom_request_id_fkey" FOREIGN KEY ("custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_complainant_id_fkey" FOREIGN KEY ("complainant_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disputes" ADD CONSTRAINT "Disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "AcademicUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AcademicUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admins"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_related_service_id_fkey" FOREIGN KEY ("related_service_id") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_related_custom_request_id_fkey" FOREIGN KEY ("related_custom_request_id") REFERENCES "CustomRequests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_related_dispute_id_fkey" FOREIGN KEY ("related_dispute_id") REFERENCES "Disputes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
