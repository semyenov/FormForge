import { builder } from '../builder';

// Define User type
export const UserType = builder.drizzleObject('users', {
  name: 'User',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    role: t.exposeString('role'),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),
  }),
});

// Query to get the current user
builder.queryField('me', (t) =>
  t.field({
    type: UserType,
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = await context.db.query.users.findFirst({
        where: { id: context.user.id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  })
);

// Query to get users (admin only)
builder.queryField('users', (t) =>
  t.field({
    type: [UserType],
    authScopes: {
      admin: true,
    },
    resolve: async (_, __, context) => {
      return context.db.query.users.findMany();
    },
  })
);
