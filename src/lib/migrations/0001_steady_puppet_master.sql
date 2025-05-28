CREATE TABLE "comment" (
	"content" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"formFieldId" text,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"reviewFlowId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_folder" (
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
CREATE TABLE "file_share" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3),
	"fileId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
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
CREATE TABLE "form_field_file" (
	"fileId" text NOT NULL,
	"formFieldId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_history" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"data" text,
	"formId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"memberId" text NOT NULL,
	"status" "FormStatus" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_template_field" (
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
CREATE TABLE "form_template" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"description" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"name" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_flow" (
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
CREATE TABLE "invitation" (
	"email" text NOT NULL,
	"expiresAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"inviterId" text NOT NULL,
	"organizationId" text NOT NULL,
	"role" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastModifiedBy" text,
	"organizationId" text NOT NULL,
	"role" "MemberRole" NOT NULL,
	"userId" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3) DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" SET DEFAULT now();