import { eq } from 'drizzle-orm';
import { tables } from '../../schema';
import { builder } from '../builder';
import { FormType } from './Form';
import { CommentType } from './Comment';

const reviewFlowStatusEnum = builder.enumType('ReviewFlowStatus', {
  values: {
    open: { value: 'open' },
    closed: { value: 'closed' },
  },
});

// Define ReviewFlow type
const ReviewFlowType = builder.drizzleNode('reviewFlows', {
  name: 'ReviewFlow',
  id: { column: (flow) => flow.id },
  fields: (t) => ({
    status: t.expose('status', { type: reviewFlowStatusEnum }),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),
    version: t.exposeInt('version'),
    formId: t.exposeString('formId'),
    organizationId: t.exposeString('organizationId'),
    lastModifiedBy: t.exposeString('lastModifiedBy', { nullable: true }),
    form: t.field({
      type: FormType,
      resolve: async (flow, _, { db }) => {
        const form = await db.query.forms.findFirst({
          where: { id: flow.formId },
        });

        if (!form) {
          throw new Error('Form not found');
        }

        return form;
      },
    }),
    comments: t.field({
      type: [CommentType],
      resolve: async (flow, _, { db }) => {
        const comments = await db.query.comments.findMany({
          where: { reviewFlowId: flow.id },
          orderBy: { createdAt: 'asc' },
        });

        return comments;
      },
    }),
  }),
});

// Input type for creating a review flow
const CreateReviewFlowInput = builder.inputType('CreateReviewFlowInput', {
  fields: (t) => ({
    formId: t.string({ required: true }),
  }),
});

// Input type for updating a review flow
const UpdateReviewFlowInput = builder.inputType('UpdateReviewFlowInput', {
  fields: (t) => ({
    status: t.field({ type: reviewFlowStatusEnum, required: false }),
  }),
});

// Query to get review flows for an organization
builder.queryField('organizationReviewFlows', (t) =>
  t.field({
    type: [ReviewFlowType],
    args: {
      organizationId: t.arg.string({ required: true }),
      status: t.arg({ type: reviewFlowStatusEnum, required: false }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { db, user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user is a member of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: args.organizationId,
        },
      });

      if (!member && user.role !== 'admin') {
        throw new Error('Not a member of this organization');
      }

      // Build query
      const query = db.query.reviewFlows.findMany({
        columns: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          version: true,
          formId: true,
          organizationId: true,
          lastModifiedBy: true,
        },
        where: {
          organizationId: args.organizationId,
          status: args.status || undefined,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return query;
    },
  })
);

// Query to get a single review flow by ID
builder.queryField('reviewFlow', (t) =>
  t.field({
    type: ReviewFlowType,
    args: {
      id: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { db, user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const reviewFlow = await db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!reviewFlow) {
        throw new Error('Review flow not found');
      }

      // Check if user is a member of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: reviewFlow.organizationId,
        },
      });

      if (!member && user.role !== 'admin') {
        throw new Error('Not authorized to view this review flow');
      }

      return reviewFlow;
    },
  })
);

// Query to get review flows for a form
builder.queryField('formReviewFlows', (t) =>
  t.field({
    type: [ReviewFlowType],
    args: {
      formId: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { db, user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get form to check organization
      const form = await db.query.forms.findFirst({
        where: { id: args.formId },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Check if user is a member of this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: form.organizationId,
        },
      });

      if (!member && user.role !== 'admin') {
        throw new Error('Not authorized to view review flows for this form');
      }

      return db.query.reviewFlows.findMany({
        where: { formId: args.formId },
        orderBy: { createdAt: 'asc' },
      });
    },
  })
);

// Mutation to create a review flow
builder.mutationField('createReviewFlow', (t) =>
  t.field({
    type: ReviewFlowType,
    args: {
      input: t.arg({ type: CreateReviewFlowInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { session, db, user }) => {
      if (!session?.activeOrganizationId) {
        throw new Error('Not authenticated or no active organization');
      }

      // Get form to check organization
      const form = await db.query.forms.findFirst({
        where: { id: args.input.formId },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Check if form belongs to the active organization
      if (form.organizationId !== session.activeOrganizationId) {
        throw new Error('Form does not belong to your active organization');
      }

      // Check if user is a reviewer or owner in this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user?.id,
          organizationId: session.activeOrganizationId,
        },
      });

      if (!member) {
        throw new Error('You are not a member of this organization');
      }

      if (member.role !== 'reviewer' && member.role !== 'owner' && user?.role !== 'admin') {
        throw new Error('You do not have permission to create review flows');
      }

      // Create the review flow
      const reviewFlowId = crypto.randomUUID();

      const reviewFlowData = {
        id: reviewFlowId,
        formId: args.input.formId,
        organizationId: session.activeOrganizationId,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: member.id,
        version: 1,
      } as const;

      await db
        .insert(tables.reviewFlows)
        .values(reviewFlowData)
        .returning();

      return reviewFlowData;
    },
  })
);

// Mutation to update a review flow
builder.mutationField('updateReviewFlow', (t) =>
  t.field({
    type: ReviewFlowType,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateReviewFlowInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, { user, db }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Find the review flow
      const reviewFlow = await db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!reviewFlow) {
        throw new Error('Review flow not found');
      }

      // Check if user is a reviewer or owner in this organization
      const member = await db.query.members.findFirst({
        where: {
          userId: user.id,
          organizationId: reviewFlow.organizationId,
        },
      });

      if (!member && user.role !== 'admin') {
        throw new Error('Not authorized to update this review flow');
      }

      if (member && member.role !== 'reviewer' && member.role !== 'owner' && user.role !== 'admin') {
        throw new Error('You do not have permission to update review flows');
      }

      // Update the review flow
      const updateValues: Record<string, any> = {
        updatedAt: new Date(),
        lastModifiedBy: member ? member.id : user.id,
        version: reviewFlow.version + 1,
      };

      if (args.input.status) {
        updateValues.status = args.input.status;
      }

      await db.update(tables.reviewFlows)
        .set(updateValues)
        .where(eq(tables.reviewFlows.id, args.id));

      // Return the updated review flow
      const updatedReviewFlow = await db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!updatedReviewFlow) {
        throw new Error('Failed to update review flow');
      }

      return updatedReviewFlow;
    },
  })
);