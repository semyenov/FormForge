import { builder } from '../builder';
import { eq } from 'drizzle-orm';
import { tables } from '../../schema';

export const SessionType = builder.drizzleNode('sessions', {
  name: 'Session',
  id: { column: (session) => session.id },
  description: 'A session is a user\'s session on the platform.',
  fields: (t) => ({
    userId: t.exposeString('userId'),
    activeOrganizationId: t.exposeString('activeOrganizationId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'Date', nullable: true }),
    expiresAt: t.expose('expiresAt', { type: 'Date', nullable: true }),
    impersonatedBy: t.exposeString('impersonatedBy', { nullable: true }),
    ipAddress: t.exposeString('ipAddress', { nullable: true }),
    token: t.exposeString('token', { nullable: true }),
    updatedAt: t.expose('updatedAt', { type: 'Date', nullable: true }),
    userAgent: t.exposeString('userAgent', { nullable: true }),
  }),
});
// Add session query to get the current user's session
builder.queryField('session', (t) =>
  t.field({
    type: SessionType,
    description: 'Get the current user\'s session.',
    resolve: async (_, __, { db, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const session = await db.query.sessions.findFirst({
        where: { userId: user.id },
        orderBy: { expiresAt: 'desc' },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    },
  })
);

// Add mutation to set active organization
builder.mutationField('setActiveOrganization', (t) =>
  t.boolean({
    description: 'Set the active organization for the current user.',
    args: {
      organizationId: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, { organizationId }, { db, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify the user is a member of this organization
      const membership = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId,
        },
      });

      if (!membership) {
        throw new Error('User is not a member of this organization');
      }

      // Update the active organization in the session
      await db.update(tables.sessions)
        .set({ activeOrganizationId: organizationId })
        .where(eq(tables.sessions.userId, user.id));

      return true;
    },
  })
);
