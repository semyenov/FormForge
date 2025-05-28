import { eq } from 'drizzle-orm';
import { tables } from '../../schema';
import { builder } from '../builder';
import { UserType } from './User';

// Define Comment type
export const CommentType = builder.drizzleObject('comments', {
  name: 'Comment',
  fields: (t) => ({
    id: t.string({
      resolve: (comment) => comment.id,
    }),
    content: t.string({
      resolve: (comment) => comment.content,
    }),
    createdAt: t.field({
      type: 'Date',
      resolve: (comment) => comment.createdAt,
    }),
    memberId: t.string({
      resolve: (comment) => comment.memberId,
    }),
    reviewFlowId: t.string({
      resolve: (comment) => comment.reviewFlowId,
    }),
    formFieldId: t.string({
      nullable: true,
      resolve: (comment) => comment.formFieldId || null,
    }),
    user: t.field({
      type: UserType,
      resolve: async (comment, _, context) => {
        // First find the member to get user ID
        const member = await context.db.query.members.findFirst({
          where: { id: comment.memberId },
        });

        if (!member) {
          throw new Error('Member not found');
        }

        // Then find the user
        const user = await context.db.query.users.findFirst({
          where: { id: member.userId },
        });

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      },
    }),
  }),
});

// Input type for creating a comment
const CreateCommentInput = builder.inputType('CreateCommentInput', {
  fields: (t) => ({
    content: t.string({ required: true }),
    reviewFlowId: t.string({ required: true }),
    formFieldId: t.string({ required: false }),
  }),
});

// Query to get comments for a review flow
builder.queryField('reviewFlowComments', (t) =>
  t.field({
    type: [CommentType],
    args: {
      reviewFlowId: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return context.db.select().from(tables.comments)
        .where(eq(tables.comments.reviewFlowId, args.reviewFlowId))
        .orderBy(tables.comments.createdAt);
    },
  })
);

// Query to get comments for a specific form field in a review flow
builder.queryField('fieldComments', (t) =>
  t.field({
    type: [CommentType],
    args: {
      reviewFlowId: t.arg.string({ required: true }),
      formFieldId: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return context.db.query.comments.findMany({
        where: {
          reviewFlowId: args.reviewFlowId,
          formFieldId: args.formFieldId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    },
  })
);

// Mutation to add a comment
builder.mutationField('addComment', (t) =>
  t.field({
    type: CommentType,
    args: {
      input: t.arg({ type: CreateCommentInput, required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, context) => {
      if (!context.user || !context.session?.activeOrganizationId) {
        throw new Error('Not authenticated or no active organization');
      }

      // Find the member ID for the current user in the active organization
      const member = await context.db.query.members.findFirst({
        where: {
          userId: context.user.id,
          organizationId: context.session.activeOrganizationId,
        },
      });

      if (!member) {
        throw new Error('You are not a member of this organization');
      }

      // Verify the review flow exists
      const reviewFlow = await context.db.query.reviewFlows.findFirst({
        where: {
          id: args.input.reviewFlowId,
          organizationId: context.session.activeOrganizationId,
        },
      });

      if (!reviewFlow) {
        throw new Error('Review flow not found or you do not have access to it');
      }

      // Create the comment
      const commentId = crypto.randomUUID();

      const commentData = {
        id: commentId,
        content: args.input.content,
        createdAt: new Date(),
        memberId: member.id,
        reviewFlowId: args.input.reviewFlowId,
        formFieldId: args.input.formFieldId || null,
      };

      await context.db
        .insert(tables.comments)
        .values(commentData)
        .returning();

      return commentData;
    },
  })
);

// Mutation to delete a comment
builder.mutationField('deleteComment', (t) =>
  t.field({
    type: 'Boolean',
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

      // Find the comment
      const comment = await context.db.query.comments.findFirst({
        where: { id: args.id },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if this user is the author of the comment (by checking membership)
      const membership = await context.db.query.members.findFirst({
        where: {
          id: comment.memberId,
          userId: context.user.id,
        },
      });

      const isAdmin = context.user.role === 'admin';

      if (!membership && !isAdmin) {
        throw new Error('You are not authorized to delete this comment');
      }

      // Delete the comment
      await context.db.delete(tables.comments)
        .where(eq(tables.comments.id, args.id));

      return true;
    },
  })
);