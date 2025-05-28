import { tables } from '../../schema';
import { builder } from '../builder';

const formFieldTypeEnum = builder.enumType('FormFieldTypeEnum', {
  values: {
    text: { value: 'text' },
    textarea: { value: 'textarea' },
    number: { value: 'number' },
    date: { value: 'date' },
    select: { value: 'select' },
    checkbox: { value: 'checkbox' },
    radio: { value: 'radio' },
    file: { value: 'file' },
  },
});

const formStatusEnum = builder.enumType('FormStatus', {
  values: {
    draft: { value: 'draft' },
    under_review: { value: 'under_review' },
    needs_changes: { value: 'needs_changes' },
    approved: { value: 'approved' },
    rejected: { value: 'rejected' },
  },
});

const formFieldStatusEnum = builder.enumType('FormFieldStatus', {
  values: {
    draft: { value: 'draft' },
    rejected: { value: 'rejected' },
    approved: { value: 'approved' },
  },
});

// Define FormField type
  const FormFieldType
  = builder.drizzleObject('formFields', {
    name: 'FormField',
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      type: t.expose('type', { type: formFieldTypeEnum }),
      required: t.exposeBoolean('required'),
      order: t.exposeInt('order'),
      options: t.exposeString('options', { nullable: true }),
      value: t.exposeString('value', { nullable: true }),
      status: t.expose('status', { type: formFieldStatusEnum }),
    }),
  });

// Define Form type
export const FormType
  = builder.drizzleObject('forms', {
    name: 'Form',
    fields: (t) => ({
      id: t.exposeID('id'),
      title: t.exposeString('title'),
      description: t.exposeString('description', { nullable: true }),
      status: t.expose('status', { type: formStatusEnum }),
      createdAt: t.expose('createdAt', { type: 'Date' }),
      updatedAt: t.expose('updatedAt', { type: 'Date' }),
      version: t.exposeInt('version'),
      fields: t.field({
        type: [FormFieldType],
        resolve: async (form, __, context) => {
          return context.db.query.formFields.findMany({
            where: { formId: form.id },
            orderBy: { order: 'asc' },
          });
        },
      }),
    }),
  });

// Input type for creating/updating form fields
const FormFieldInput
  = builder.inputType('FormFieldInput', {
    fields: (t) => ({
      id: t.string({ required: false }),
      name: t.string({ required: true }),
      type: t.field({ type: formFieldTypeEnum, required: true }),
      required: t.boolean({ required: true }),
      order: t.int({ required: true }),
      options: t.string({ required: false }),
    }),
  });

// Input type for creating a form
const CreateFormInput
  = builder.inputType('CreateFormInput', {
    fields: (t) => ({
      title: t.string({ required: true }),
      description: t.string({ required: false }),
      fields: t.field({ type: [FormFieldInput], required: true }),
    }),
  });

// Query to get all forms for the current user's organization
builder.queryField('forms', (t) =>
  t.field({
    type: [FormType],
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, __, context) => {
      if (!context.session?.activeOrganizationId) {
        throw new Error('No active organization');
      }

      return context.db.query.forms.findMany({
        where: { organizationId: context.session.activeOrganizationId },
      });
    },
  })
);

// Query to get a single form by ID
builder.queryField('form', (t) =>
  t.field({
    type: FormType,
    args: {
      id: t.arg.string({ required: true }),
    },
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, args, context) => {
      const form = await context.db.query.forms.findFirst({
        where: { id: args.id },
      });

      if (!form) {
        throw new Error('Form not found');
      }

      return form;
    },
  })
);

// Mutation to create a form
builder.mutationField('createForm', (t) =>
  t.field({
    type: FormType,
    args: {
      input: t.arg({ type: CreateFormInput, required: true }),
    },
    // authScopes: {
    //   loggedIn: true,
    // },
    resolve: async (_, args, context) => {
      if (!context.user || !context.session?.activeOrganizationId) {
        throw new Error('Not authenticated or no active organization');
      }

      const formId = crypto.randomUUID();

      // Create the form
      await context.db.insert(tables.forms).values({
        id: formId,
        title: args.input.title,
        description: args.input.description || null,
        creatorMemberId: context.user.id, // This would actually be a member ID in a real app
        organizationId: context.session.activeOrganizationId,
        status: 'draft',
        updatedAt: new Date(),
      });

      // Create the form fields
      if (args.input.fields.length > 0) {
        await context.db.insert(tables.formFields).values(
          (
          args.input.fields.map(
            field => ({
              id: crypto.randomUUID(),
              formId: formId,
              name: field.name,
              type: field.type,
              required: field.required,
              order: field.order,
              options: field.options || null,
              status: 'draft' as const,
            }))
        ))
      }

      // Return the created form
      const newForm = await context.db.query.forms.findFirst({
        where: { id: formId },
      });

      if (!newForm) {
        throw new Error('Failed to create form');
      }

      return newForm;
    },
  })
);
