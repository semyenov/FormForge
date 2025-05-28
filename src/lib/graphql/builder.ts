import SchemaBuilder from '@pothos/core';
import DrizzlePlugin from '@pothos/plugin-drizzle';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import ValidationPlugin from '@pothos/plugin-validation';
import WithInputPlugin from '@pothos/plugin-with-input';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { db } from '../db';
import relations from '../schema/relations';
import { CookieAttributes } from 'lucia';

// Create a context type that includes the session and database
export interface Context {
  db: typeof db;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  session?: {
    id: string;
    userId: string;
    activeOrganizationId?: string;
  } | null;
  req: {
    cookies: {
      get: (name: string) => { value: string | undefined };
      set: (name: string, value: string, attributes: CookieAttributes ) => void;
    };
  };
}

export type Scalars = {
  Date: {
    Input: Date;
    Output: Date;
  };
};

export interface AuthScopes {
  loggedIn: boolean;
  admin: boolean;
};

type DrizzleRelations = typeof relations;

// Create the schema builder instance with plugins
export const builder = new SchemaBuilder<{
  DrizzleRelations: DrizzleRelations;
  Context: Context;
  Scalars: Scalars;
  AuthScopes: AuthScopes
}>({
  plugins: [
    DrizzlePlugin,
    ValidationPlugin,
    ScopeAuthPlugin,
    WithInputPlugin,
  ],
  drizzle: {
    client: db,
    getTableConfig,
  },
  scopeAuth: {
    authScopes: async (context) => ({
      loggedIn: !!context.user,
      admin: context.user?.role === 'admin',
    }),
  }
});

// Define a date scalar for handling date fields
builder.scalarType('Date', {
  serialize: (date) => date.toISOString(),
  parseValue: (value) => new Date(value as string),
});

// Create Query and Mutation types
builder.queryType({
  description: 'The root query type',
});

builder.mutationType({
  description: 'The root mutation type',
});

export default builder;
