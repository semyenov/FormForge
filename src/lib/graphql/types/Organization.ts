import { eq } from 'drizzle-orm';
import { tables } from '../../schema';
import { builder } from '../builder';
import { MemberType, memberRoleEnum } from './Member';

// Define Organization type
export const OrganizationType = builder.drizzleNode('organizations', {
  name: 'Organization',
  id: { column: (organization) => organization.id },
  fields: (t) => ({
    name: t.exposeString('name'),
    slug: t.exposeString('slug', { nullable: true }),
    logo: t.exposeString('logo', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    members: t.field({
      type: [MemberType],
      resolve: async (organization, _, context) => {
        return context.db.query.members.findMany({
          where: { organizationId: organization.id },
        });
      },
    }),
  }),
});

// Input type for creating an organization
const CreateOrganizationInput = builder.inputType('CreateOrganizationInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    slug: t.string({ required: false }),
    logo: t.string({ required: false }),
  }),
});

// Input type for updating an organization
const UpdateOrganizationInput = builder.inputType('UpdateOrganizationInput', {
  fields: (t) => ({
    name: t.string({ required: false }),
    slug: t.string({ required: false }),
    logo: t.string({ required: false }),
  }),
});

// Input type for inviting a member
const InviteMemberInput = builder.inputType('InviteMemberInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    role: t.field({ type: memberRoleEnum, required: true }),
    organizationId: t.string({ required: true }),
  }),
});

// Query to get all organizations for the current user
builder.queryField('organizations', (t) =>
  t.field({
    type: [OrganizationType],
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, __, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get all members for the current user
      const members = await db.query.members.findMany({
        where: { userId: user.id },
      });

      // Get all organizations for those members
      const organizationIds = members.map(member => member.organizationId);
      if (organizationIds.length === 0) {
        return [];
      }

      return db.query.organizations.findMany({
        where: { id: { in: organizationIds } },
      });
    },
  })
);

// Query to get a single organization by ID
builder.queryField('organization', (t) =>
  t.field({
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user is a member of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: args.id,
        },
      });

      if (!member) {
        throw new Error('Not a member of this organization');
      }

      const organization = await db.query.organizations.findFirst({
        where: { id: args.id },
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      return organization;
    },
  })
);

// Mutation to create an organization
builder.mutationField('createOrganization', (t) =>
  t.field({
    type: OrganizationType,
    args: {
      input: t.arg({ type: CreateOrganizationInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const organizationId = crypto.randomUUID();

      // Create the organization
      await db.insert(tables.organizations).values({
        id: organizationId,
        name: args.input.name,
        slug: args.input.slug || null,
        logo: args.input.logo || null,
        createdAt: new Date(),
        metadata: JSON.stringify({}),
      });

      // Return the created organization
      const newOrganization = await db.query.organizations.findFirst({
        where: { id: organizationId },
      });

      if (!newOrganization) {
        throw new Error('Failed to create organization');
      }

      // Add the current user as an owner
      const memberId = crypto.randomUUID();

      await db
        .insert(tables.members)
        .values({
          id: memberId,
          userId: user.id,
          organizationId: organizationId,
          role: 'owner',
          createdAt: new Date(),
          lastModifiedBy: user.id,
          version: 1,
        });

      return newOrganization;
    },
  })
);

// Mutation to update an organization
builder.mutationField('updateOrganization', (t) =>
  t.field({
    type: OrganizationType,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateOrganizationInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user is an owner of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: args.id,
          role: 'owner',
        },
      });

      if (!member) {
        throw new Error('Not authorized to update this organization');
      }

      // Update the organization
      const updateValues: Record<string, any> = {};
      if (args.input.name) updateValues.name = args.input.name;
      if (args.input.slug !== undefined) updateValues.slug = args.input.slug;
      if (args.input.logo !== undefined) updateValues.logo = args.input.logo;

      if (Object.keys(updateValues).length > 0) {
        await db.update(tables.organizations)
          .set(updateValues)
          .where(eq(tables.organizations.id, args.id));
      }

      // Return the updated organization
      const updatedOrganization = await db.query.organizations.findFirst({
        where: { id: args.id },
      });

      if (!updatedOrganization) {
        throw new Error('Organization not found');
      }

      return updatedOrganization;
    },
  })
);

// Mutation to invite a new member
builder.mutationField('inviteMember', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      input: t.arg({ type: InviteMemberInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user is an owner or admin of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: args.input.organizationId,
          role: 'owner',
        },
      });

      if (!member && user.role !== 'admin') {
        throw new Error('Not authorized to invite members to this organization');
      }

      const invitationId = crypto.randomUUID();

      // Create the invitation (expires in 7 days)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      await db.insert(tables.invitations).values({
        id: invitationId,
        email: args.input.email,
        organizationId: args.input.organizationId,
        inviterId: user.id,
        role: args.input.role,
        status: 'pending',
        expiresAt: expirationDate,
      });

      // In a real app, you would send an email to the invited user here

      return true;
    },
  })
);

// // Mutation to set active organization
// builder.mutationField('setActiveOrganization', (t) =>
//   t.field({
//     type: 'Boolean',
//     args: {
//       organizationId: t.arg.string({ required: true }),
//     },
//     authScopes: {
//       loggedIn: true,
//     },
//     resolve: async (_, args, context) => {
//       if (!context.user) {
//         throw new Error('Not authenticated');
//       }

//       // Check if user is a member of this organization
//       const member = await context.db.query.members.findFirst({
//         where: {
//           userId: context.user.id,
//           organizationId: args.organizationId,
//         },
//       });

//       if (!member) {
//         throw new Error('Not a member of this organization');
//       }

//       // Get current session
//       const session = await context.db.query.sessions.findFirst({
//         where: { userId: context.user.id },
//         orderBy: { createdAt: 'desc' },
//       });

//       if (!session) {
//         throw new Error('No active session found');
//       }

//       // Update the session with the active organization
//       await context.db.update(tables.sessions)
//         .set({ activeOrganizationId: args.organizationId })
//         .where(eq(tables.sessions.id, session.id));

//       return true;
//     },
//   })
// );
