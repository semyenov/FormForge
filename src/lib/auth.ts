import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { db, Session, User } from './db';
import { tables } from './schema';

// Create the adapter for Lucia
const adapter = new DrizzlePostgreSQLAdapter(
  db,
  tables.sessions,
  tables.users
);

// Create the Lucia instance
export const lucia = new Lucia<Session, User>(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? 'localhost' : undefined,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
      email: attributes.email,
      role: attributes.role,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      banExpires: attributes.banExpires,
      banned: attributes.banned,
      banReason: attributes.banReason,
      emailVerified: attributes.emailVerified,
      image: attributes.image,
    };
  },
});

// Declare the Lucia namespace types
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: User;
    DatabaseSessionAttributes: Session;
  }
}
