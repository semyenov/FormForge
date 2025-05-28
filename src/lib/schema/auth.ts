import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("UserRole", [
  "user",
  "admin",
]);

export const users = pgTable("users", {
  banExpires: timestamp("banExpires", { mode: "date", precision: 3 }),
  banned: boolean("banned"),
  banReason: text("banReason"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull()
    .defaultNow(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  activeOrganizationId: text("activeOrganizationId"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
  id: text("id").primaryKey(),
  impersonatedBy: text("impersonatedBy"),
  ipAddress: text("ipAddress"),
  token: text("token").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  userAgent: text("userAgent"),
  userId: text("userId").notNull(),
});

export const accounts = pgTable("accounts", {
  accessToken: text("accessToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    mode: "date",
    precision: 3,
  }),
  accountId: text("accountId").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  idToken: text("idToken"),
  password: text("password"),
  providerId: text("providerId").notNull(),
  refreshToken: text("refreshToken"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    mode: "date",
    precision: 3,
  }),
  scope: text("scope"),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  userId: text("userId").notNull(),
});

export const verifications = pgTable("verifications", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  value: text("value").notNull(),
});

export const organizations = pgTable("organizations", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  logo: text("logo"),
  metadata: text("metadata"),
  name: text("name").notNull(),
  slug: text("slug"),
});

export const memberRoleEnum = pgEnum("MemberRole", [
  "owner",
  "reviewer",
  "executor",
  "member",
]);

export const members = pgTable("members", {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).defaultNow().notNull()
    .defaultNow(),
  id: text("id").primaryKey(),
  lastModifiedBy: text("lastModifiedBy"),
  organizationId: text("organizationId").notNull(),
  role: memberRoleEnum("role").notNull(),
  userId: text("userId").notNull(),
  version: integer("version").default(1).notNull(),
});

export const invitations = pgTable("invitations", {
  email: text("email").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  inviterId: text("inviterId").notNull(),
  organizationId: text("organizationId").notNull(),
  role: text("role"),
  status: text("status").notNull(),
});
