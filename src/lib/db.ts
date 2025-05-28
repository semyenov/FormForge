import { drizzle } from 'drizzle-orm/pglite';
import { Tables, tables } from './schema';
import relations from './schema/relations';

// Create a Postgres connection pool
const connectionString: string = process.env.VITE_DATABASE_URL || './dev.db';

// Create a Drizzle ORM instance
export const db = drizzle(connectionString, {
  casing: 'camelCase',
  schema: tables,
  relations,
});

export default db;

export type DB = typeof db;

export type User = Tables['users']['$inferSelect'];
export type Account = Tables['accounts']['$inferSelect'];
export type Session = Tables['sessions']['$inferSelect'];
export type Organization = Tables['organizations']['$inferSelect'];
export type Member = Tables['members']['$inferSelect'];
export type Form = Tables['forms']['$inferSelect'];
export type FormTemplate = Tables['formTemplates']['$inferSelect'];
export type FormTemplateField = Tables['formTemplateFields']['$inferSelect'];
export type FormField = Tables['formFields']['$inferSelect'];