/*
  Warnings:

  - You are about to drop the column `session_id` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."sessions_session_id_key";

-- DropIndex
DROP INDEX "public"."sessions_uuid_idx";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "session_id",
DROP COLUMN "uuid",
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
