import { builder } from '../builder';

export const UserType = builder.drizzleNode('users', {
  name: 'User',
  id: { column: (user) => user.id },
  fields: (t) => ({
    banExpires: t.expose('banExpires', { type: 'Date', nullable: true }),
    banned: t.exposeBoolean('banned', { nullable: true }),
    banReason: t.exposeString('banReason', { nullable: true }),
    emailVerified: t.exposeBoolean('emailVerified', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    role: t.exposeString('role'),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),
    members: t.relation('members'),
  }),
});

// Query to get the current user
builder.queryField('me', (t) =>
  t.field({
    type: UserType,
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, __, { db, user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const foundUser = await db.query.users.findFirst({
        where: { id: user.id },
        with: {
          members: {
            with: {
              organization: true,
            },
          },
        },
      });

      if (!foundUser) {
        throw new Error('User not found');
      }

      return foundUser;
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
    resolve: async (_, __, { db }) => {
      const foundUsers = await db.query.users.findMany();
      return foundUsers;
    },
  })
);
