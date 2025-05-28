import { builder } from '../builder';
import { eq } from 'drizzle-orm';
import { tables } from '../../schema';

// Define the Session type
export const SessionType = builder.objectRef<{
  id: string;
  userId: string;
  activeOrganizationId: string;
}>('Session').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    activeOrganizationId: t.exposeString('activeOrganizationId'),
  }),
});

// Add session query to get the current user's session
builder.queryField('session', (t) =>
  t.field({
    type: SessionType,
    nullable: true,
    resolve: async (_, __, {db, user}) => {
      if (!user) {
        return null;
      }

      const session = await db.query.sessions.findFirst({
        where: { userId: user.id },
        orderBy: { expiresAt: 'desc' },
      });

      if (!session) {
        return null;
      }

      return {
        id: session.id,
        userId: session.userId,
        activeOrganizationId: session.activeOrganizationId || '',
      };
    },
  })
);

// Add mutation to set active organization
builder.mutationField('setActiveOrganization', (t) =>
  t.boolean({
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
