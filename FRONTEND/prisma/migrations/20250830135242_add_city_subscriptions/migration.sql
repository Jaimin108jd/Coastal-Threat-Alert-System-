/*
  Warnings:

  - A unique constraint covering the columns `[userId,state,city]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Alert_state_status_idx";

-- DropIndex
DROP INDEX "public"."Subscription_userId_state_key";

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "city" TEXT;

-- CreateIndex
CREATE INDEX "Alert_state_region_status_idx" ON "public"."Alert"("state", "region", "status");

-- CreateIndex
CREATE INDEX "Alert_region_state_idx" ON "public"."Alert"("region", "state");

-- CreateIndex
CREATE INDEX "Subscription_state_city_active_idx" ON "public"."Subscription"("state", "city", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_state_city_key" ON "public"."Subscription"("userId", "state", "city");
