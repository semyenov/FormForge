import { builder } from '../builder';
import { Account } from '../../db';
import { UserType } from './User';

export const AccountType = builder.drizzleNode('accounts', {
  name: 'Account',
  id: { column: (account) => account.id },
  fields: (t) => ({
    userId: t.exposeString('userId'),
    providerId: t.exposeString('providerId'),
    accountId: t.exposeString('accountId'),
    accessToken: t.exposeString('accessToken', { nullable: true }),
    accessTokenExpiresAt: t.expose('accessTokenExpiresAt', { type: 'Date', nullable: true }),
    refreshToken: t.exposeString('refreshToken', { nullable: true }),
    refreshTokenExpiresAt: t.expose('refreshTokenExpiresAt', { type: 'Date', nullable: true }),
    idToken: t.exposeString('idToken', { nullable: true }),
    password: t.exposeString('password', { nullable: true }),
    scope: t.exposeString('scope', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),
    user: t.field({
      type: UserType,
      resolve: async (_, __, { db, user }) => {
        if (!user) {
          throw new Error('User not found');
        }

        const foundUser = await db.query.users.findFirst({
          where: { id: user.id },
        });
        if (!foundUser) {
          throw new Error('User not found');
        }

        return foundUser;
      },
    }),
  }),
});

export type { Account };
