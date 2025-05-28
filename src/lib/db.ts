import { drizzle } from 'drizzle-orm/pglite';
import { tables } from './schema';
import relations from './schema/relations';

// Create a Postgres connection pool
const connectionString: string = process.env.VITE_DATABASE_URL || './dev.db';

// Create a Drizzle ORM instance
export const db
  = drizzle(connectionString, {
    casing: 'camelCase',
    schema: tables,
    relations,
  });

export default db;
