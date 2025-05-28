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
const ReviewFlowType = builder.drizzleObject('reviewFlows', {
  name: 'ReviewFlow',
  fields: (t) => ({
    id: t.string({
      resolve: (flow) => flow.id,
    }),
    status: t.field({
      type: reviewFlowStatusEnum,
      resolve: (flow) => flow.status,
    }),
    createdAt: t.field({
      type: 'Date',
      resolve: (flow) => flow.createdAt,
    }),
    updatedAt: t.field({
      type: 'Date',
      resolve: (flow) => flow.updatedAt,
    }),
    version: t.int({
      resolve: (flow) => flow.version,
    }),
    formId: t.string({
      resolve: (flow) => flow.formId,
    }),
    organizationId: t.string({
      resolve: (flow) => flow.organizationId,
    }),
    lastModifiedBy: t.string({
      nullable: true,
      resolve: (flow) => flow.lastModifiedBy || null,
    }),
    form: t.field({
      type: FormType,
      resolve: async (flow, _, context) => {
        const form = await context.db.query.forms.findFirst({
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
      resolve: async (flow, _, context) => {
        const comments = await context.db.select().from(tables.comments)
          .where(eq(tables.comments.reviewFlowId, flow.id))
          .orderBy(tables.comments.createdAt);

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
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Check if user is a member of this organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user.id,
          organizationId: args.organizationId,
        },
      });

      if (!member && context.user.role !== 'admin') {
        throw new Error('Not a member of this organization');
      }

      // Build query
      const query = context.db.query.reviewFlows.findMany({
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
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const reviewFlow = await context.db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!reviewFlow) {
        throw new Error('Review flow not found');
      }

      // Check if user is a member of this organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user.id,
          organizationId: reviewFlow.organizationId,
        },
      });

      if (!member && context.user.role !== 'admin') {
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
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Get form to check organization
      const form = await context.db.query.forms.findFirst({
        where: { id: args.formId },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Check if user is a member of this organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user.id,
          organizationId: form.organizationId,
        },
      });

      if (!member && context.user.role !== 'admin') {
        throw new Error('Not authorized to view review flows for this form');
      }

      return context.db.select().from(tables.reviewFlows)
        .where(eq(tables.reviewFlows.formId, args.formId))
        .orderBy(tables.reviewFlows.createdAt);
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
    resolve: async (_, args, context) => {
      if (!context.session?.activeOrganizationId) {
        throw new Error('Not authenticated or no active organization');
      }

      // Get form to check organization
      const form = await context.db.query.forms.findFirst({
        where: { id: args.input.formId },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      // Check if form belongs to the active organization
      if (form.organizationId !== context.session.activeOrganizationId) {
        throw new Error('Form does not belong to your active organization');
      }

      // Check if user is a reviewer or owner in this organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user?.id,
          organizationId: context.session.activeOrganizationId,
        },
      });

      if (!member) {
        throw new Error('You are not a member of this organization');
      }

      if (member.role !== 'reviewer' && member.role !== 'owner' && context.user?.role !== 'admin') {
        throw new Error('You do not have permission to create review flows');
      }

      // Create the review flow
      const reviewFlowId = crypto.randomUUID();

      const reviewFlowData = {
        id: reviewFlowId,
        formId: args.input.formId,
        organizationId: context.session.activeOrganizationId,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: member.id,
        version: 1,
      } as const;

      await context.db
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
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Find the review flow
      const reviewFlow = await context.db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!reviewFlow) {
        throw new Error('Review flow not found');
      }

      // Check if user is a reviewer or owner in this organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user.id,
          organizationId: reviewFlow.organizationId,
        },
      });

      if (!member && context.user.role !== 'admin') {
        throw new Error('Not authorized to update this review flow');
      }

      if (member && member.role !== 'reviewer' && member.role !== 'owner' && context.user.role !== 'admin') {
        throw new Error('You do not have permission to update review flows');
      }

      // Update the review flow
      const updateValues: Record<string, any> = {
        updatedAt: new Date(),
        lastModifiedBy: member ? member.id : context.user.id,
        version: reviewFlow.version + 1,
      };

      if (args.input.status) {
        updateValues.status = args.input.status;
      }

      await context.db.update(tables.reviewFlows)
        .set(updateValues)
        .where(eq(tables.reviewFlows.id, args.id));

      // Return the updated review flow
      const updatedReviewFlow = await context.db.query.reviewFlows.findFirst({
        where: { id: args.id },
      });

      if (!updatedReviewFlow) {
        throw new Error('Failed to update review flow');
      }

      return updatedReviewFlow;
    },
  })
);