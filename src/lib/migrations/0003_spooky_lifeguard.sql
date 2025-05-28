CREATE TABLE "comments" (
	"content" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"formFieldId" text,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"reviewFlowId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_folders" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"creatorMemberId" text NOT NULL,
	"description" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"level" integer NOT NULL,
	"name" text NOT NULL,
	"organizationId" text NOT NULL,
	"parentId" text,
	"path" text,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_shares" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3),
	"fileId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"accessedAt" timestamp (3),
	"accessLevel" "FileAccess" DEFAULT 'organization' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"description" text,
	"filename" text NOT NULL,
	"folderId" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"mimeType" text NOT NULL,
	"organizationId" text NOT NULL,
	"originalName" text NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"uploaderMemberId" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_field_files" (
	"fileId" text NOT NULL,
	"formFieldId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
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
CREATE TABLE "form_histories" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"data" text,
	"formId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"status" "FormStatus" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_template_fields" (
	"defaultValue" text,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"options" text,
	"order" integer NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"templateId" text NOT NULL,
	"type" "FieldType" NOT NULL,
	"validationRules" text
);
--> statement-breakpoint
CREATE TABLE "form_templates" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"description" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"name" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"creatorMemberId" text NOT NULL,
	"description" text,
	"executorMemberId" text,
	"lastModifiedBy" text,
	"organizationId" text NOT NULL,
	"status" "FormStatus" DEFAULT 'draft' NOT NULL,
	"templateId" text,
	"title" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_flows" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"formId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"organizationId" text NOT NULL,
	"status" "ReviewFlowStatus" DEFAULT 'open' NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"accessToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"accountId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"idToken" text,
	"password" text,
	"providerId" text NOT NULL,
	"refreshToken" text,
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"email" text NOT NULL,
	"expiresAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"inviterId" text NOT NULL,
	"organizationId" text NOT NULL,
	"role" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"organizationId" text NOT NULL,
	"role" "MemberRole" NOT NULL,
	"userId" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"logo" text,
	"metadata" text,
	"name" text NOT NULL,
	"slug" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"activeOrganizationId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"impersonatedBy" text,
	"ipAddress" text,
	"token" text NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"userAgent" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
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
--> statement-breakpoint
CREATE TABLE "verifications" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "comment" CASCADE;--> statement-breakpoint
DROP TABLE "file_folder" CASCADE;--> statement-breakpoint
DROP TABLE "file_share" CASCADE;--> statement-breakpoint
DROP TABLE "file" CASCADE;--> statement-breakpoint
DROP TABLE "form_field_file" CASCADE;--> statement-breakpoint
DROP TABLE "form_field" CASCADE;--> statement-breakpoint
DROP TABLE "form_history" CASCADE;--> statement-breakpoint
DROP TABLE "form_template_field" CASCADE;--> statement-breakpoint
DROP TABLE "form_template" CASCADE;--> statement-breakpoint
DROP TABLE "form" CASCADE;--> statement-breakpoint
DROP TABLE "review_flow" CASCADE;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;