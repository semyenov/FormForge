CREATE TYPE "public"."FieldType" AS ENUM('text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio', 'file');--> statement-breakpoint
CREATE TYPE "public"."FileAccess" AS ENUM('private', 'organization', 'public');--> statement-breakpoint
CREATE TYPE "public"."FormFieldStatus" AS ENUM('draft', 'rejected', 'approved');--> statement-breakpoint
CREATE TYPE "public"."FormStatus" AS ENUM('draft', 'under_review', 'needs_changes', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."MemberRole" AS ENUM('owner', 'reviewer', 'executor', 'member');--> statement-breakpoint
CREATE TYPE "public"."ReviewFlowStatus" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"accessToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"accountId" text NOT NULL,
	"createdAt" timestamp (3) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"idToken" text,
	"password" text,
	"providerId" text NOT NULL,
	"refreshToken" text,
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"formId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"options" text,
	"order" integer NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"status" "FormFieldStatus" DEFAULT 'draft' NOT NULL,
	"type" "FieldType" NOT NULL,
	"validationRules" text,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "form" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"creatorMemberId" text NOT NULL,
	"description" text,
	"executorMemberId" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"organizationId" text NOT NULL,
	"status" "FormStatus" DEFAULT 'draft' NOT NULL,
	"templateId" text,
	"title" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"createdAt" timestamp (3) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"logo" text,
	"metadata" text,
	"name" text NOT NULL,
	"slug" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"activeOrganizationId" text,
	"createdAt" timestamp (3) NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"impersonatedBy" text,
	"ipAddress" text,
	"token" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userAgent" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"banExpires" timestamp (3),
	"banned" boolean,
	"banReason" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"role" "UserRole" DEFAULT 'user' NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
