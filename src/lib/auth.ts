import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { db } from './db';
import { tables } from './schema';

// Create the adapter for Lucia
const adapter = new DrizzlePostgreSQLAdapter(
  db,
  tables.sessions,
  tables.users
);

// Create the Lucia instance
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
      email: attributes.email,
      role: attributes.role,
    };
  },
});

// Declare the Lucia namespace types
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}
