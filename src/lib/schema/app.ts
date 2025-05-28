import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";

export const formStatusEnum = pgEnum("FormStatus", [
  "draft",
  "under_review",
  "needs_changes",
  "approved",
  "rejected",
]);

export const forms = pgTable("forms", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  creatorMemberId: text("creatorMemberId").notNull(),
  description: text("description"),
  executorMemberId: text("executorMemberId"),
  lastModifiedBy: text("lastModifiedBy"),
  organizationId: text("organizationId").notNull(),
  status: formStatusEnum("status").default("draft").notNull(),
  templateId: text("templateId"),
  title: text("title").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  version: integer("version").default(1).notNull(),
});

export const fieldTypeEnum = pgEnum("FieldType", [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "checkbox",
  "radio",
  "file",
]);

export const formFieldStatusEnum = pgEnum("FormFieldStatus", [
  "draft",
  "rejected",
  "approved",
]);

export const formFields = pgTable("form_fields", {
  formId: text("formId").notNull(),
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  options: text("options"),
  order: integer("order").notNull(),
  required: boolean("required").default(false).notNull(),
  status: formFieldStatusEnum("status").default("draft").notNull(),
  type: fieldTypeEnum("type").notNull(),
  validationRules: text("validationRules"),
  value: text("value"),
});

export const formTemplates = pgTable("form_templates", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  description: text("description"),
  id: text("id").primaryKey(),
  lastModifiedBy: text("lastModifiedBy"),
  name: text("name").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  version: integer("version").default(1).notNull(),
});

export const formTemplateFields = pgTable("form_template_fields", {
  defaultValue: text("defaultValue"),
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  options: text("options"),
  order: integer("order").notNull(),
  required: boolean("required").default(false).notNull(),
  templateId: text("templateId").notNull(),
  type: fieldTypeEnum("type").notNull(),
  validationRules: text("validationRules"),
});

export const formHistories = pgTable("form_histories", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  data: text("data"),
  formId: text("formId").notNull(),
  id: text("id").primaryKey(),
  memberId: text("memberId").notNull(),
  status: formStatusEnum("status").notNull(),
});

export const reviewFlowStatusEnum = pgEnum("ReviewFlowStatus", [
  "open",
  "closed",
]);

export const reviewFlows = pgTable("review_flows", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  formId: text("formId").notNull(),
  id: text("id").primaryKey(),
  lastModifiedBy: text("lastModifiedBy"),
  organizationId: text("organizationId").notNull(),
  status: reviewFlowStatusEnum("status").default("open").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  version: integer("version").default(1).notNull(),
});

export const comments = pgTable("comments", {
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  formFieldId: text("formFieldId"),
  id: text("id").primaryKey(),
  memberId: text("memberId").notNull(),
  reviewFlowId: text("reviewFlowId").notNull(),
});

export const fileAccessEnum = pgEnum("FileAccess", [
  "private",
  "organization",
  "public",
]);

export const files = pgTable("files", {
  accessedAt: timestamp("accessedAt", { mode: "date", precision: 3 }),
  accessLevel: fileAccessEnum("accessLevel").default("organization").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  deleted: boolean("deleted").default(false).notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  folderId: text("folderId"),
  id: text("id").primaryKey(),
  lastModifiedBy: text("lastModifiedBy"),
  mimeType: text("mimeType").notNull(),
  organizationId: text("organizationId").notNull(),
  originalName: text("originalName").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  uploaderMemberId: text("uploaderMemberId").notNull(),
  version: integer("version").default(1).notNull(),
});

export const fileFolders = pgTable("file_folders", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  creatorMemberId: text("creatorMemberId").notNull(),
  description: text("description"),
  id: text("id").primaryKey(),
  lastModifiedBy: text("lastModifiedBy"),
  level: integer("level").notNull(),
  name: text("name").notNull(),
  organizationId: text("organizationId").notNull(),
  parentId: text("parentId"),
  path: text("path"),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  version: integer("version").default(1).notNull(),
});

export const fileShares = pgTable("file_shares", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull().defaultNow(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }),
  fileId: text("fileId").notNull(),
  id: text("id").primaryKey(),
  memberId: text("memberId").notNull(),
});

export const formFieldFiles = pgTable("form_field_files", {
  fileId: text("fileId").notNull(),
  formFieldId: text("formFieldId").notNull(),
  id: text("id").primaryKey(),
});
