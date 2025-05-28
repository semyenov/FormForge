import { Session, User } from '@/__generated__/types.generated';
import SchemaBuilder from '@pothos/core';
import DrizzlePlugin from '@pothos/plugin-drizzle';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import TracingPlugin, { isRootField, wrapResolver } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import WithInputPlugin from '@pothos/plugin-with-input';
import { CookieStore } from '@whatwg-node/cookie-store';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { db } from '../db';
import relations from '../schema/relations';

// Create a context type that includes the session and database
export interface Context {
  db: typeof db;
  user?: User | null;
  session?: Session | null;
  cookies: CookieStore;
}

export type Scalars = {
  ID: {
    Input: number | string;
    Output: number | string;
  };
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
  Defaults: 'v4';
  DefaultFieldNullability: false;
  Tracing: boolean | { formatMessage: (duration: number) => string };
  DrizzleRelations: DrizzleRelations;
  Context: Context;
  Scalars: Scalars;
  AuthScopes: AuthScopes;
}>({
  defaults: 'v4',
  defaultFieldNullability: false,

  plugins: [
    TracingPlugin,
    DrizzlePlugin,
    ValidationPlugin,
    ScopeAuthPlugin,
    WithInputPlugin,
    RelayPlugin,
  ],

  drizzle: {
    client: db,
    relations,
    getTableConfig,
  },
  scopeAuth: {
    authScopes: async (context) => {
      return {
        loggedIn: !!context.user,
        admin: context.user?.role === 'admin',
      };
    },
  },
  tracing: {
    default: (config) => {
      return isRootField(config) ? true : false;
    },
    wrap: (resolve, options, fieldConfig) => {
      const isRoot = isRootField(fieldConfig);
      if (isRoot) {
        return resolve;
      }
      return wrapResolver(resolve, (error, duration) => {
        const message =
          typeof options === 'object'
            ? options.formatMessage(duration)
            : `Executed resolver ${fieldConfig.parentType}.${fieldConfig.name} in ${duration}ms`;

        console.log(message);
        return error;
      });
    },
  },
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
