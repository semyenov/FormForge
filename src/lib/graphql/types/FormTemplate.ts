import { eq } from 'drizzle-orm';
import { tables } from '../../schema';
import { builder } from '../builder';

const formFieldTypeEnum = builder.enumType('FormFieldType', {
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

// Define FormTemplateField type
const FormTemplateFieldType = builder.drizzleObject('formTemplateFields', {
    name: 'FormTemplateField',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        type: t.expose('type', { type: formFieldTypeEnum }),
        required: t.expose('required', { type: 'Boolean' }),
        order: t.expose('order', { type: 'Int' }),
        options: t.expose('options', { type: 'String' }),
        defaultValue: t.expose('defaultValue', { type: 'String' }),
        validationRules: t.expose('validationRules', { type: 'String' }),
    }),
});

// Define FormTemplate type
const FormTemplateType = builder.drizzleObject('formTemplates', {
    name: 'FormTemplate',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        description: t.expose('description', { type: 'String' }),
        createdAt: t.expose('createdAt', { type: 'Date' }),
        updatedAt: t.expose('updatedAt', { type: 'Date' }),
        version: t.expose('version', { type: 'Int' }),
        fields: t.field({
            type: [FormTemplateFieldType],
            resolve: async (template, _, context) => {
                return context.db.query.formTemplateFields.findMany({
                    where: { templateId: template.id },
                    orderBy: { order: 'asc' },
                });
            },
        }),
    }),
});

// Input type for creating/updating template fields
const FormTemplateFieldInput = builder.inputType('FormTemplateFieldInput', {
    fields: (t) => ({
        id: t.string({ required: false }),
        name: t.string({ required: true }),
        type: t.field({ type: formFieldTypeEnum, required: true }),
        required: t.boolean({ required: true }),
        order: t.int({ required: true }),
        options: t.string({ required: false }),
        defaultValue: t.string({ required: false }),
        validationRules: t.string({ required: false }),
    }),
});

// Input type for creating a form template
const CreateFormTemplateInput = builder.inputType('CreateFormTemplateInput', {
    fields: (t) => ({
        name: t.string({ required: true }),
        description: t.string({ required: false }),
        fields: t.field({ type: [FormTemplateFieldInput], required: true }),
    }),
});

// Input type for updating a form template
const UpdateFormTemplateInput = builder.inputType('UpdateFormTemplateInput', {
    fields: (t) => ({
        name: t.string({ required: false }),
        description: t.string({ required: false }),
        fields: t.field({ type: [FormTemplateFieldInput], required: false }),
    }),
});

// Query to get all form templates
builder.queryField('formTemplates', (t) =>
    t.field({
        type: [FormTemplateType],
        authScopes: {
            loggedIn: true,
        },
        resolve: async (_, __, context) => {
            return context.db.query.formTemplates.findMany({
                orderBy: { name: 'asc' },
            });
        },
    })
);

// Query to get a single form template by ID
builder.queryField('formTemplate', (t) =>
    t.field({
        type: FormTemplateType,
        args: {
            id: t.arg.string({ required: true }),
        },
        authScopes: {
            loggedIn: true,
        },
        resolve: async (_, args, context) => {
            const template = await context.db.query.formTemplates.findFirst({
                where: { id: args.id },
            });

            if (!template) {
                throw new Error('Form template not found');
            }

            return template;
        },
    })
);

// Mutation to create a form template
builder.mutationField('createFormTemplate', (t) =>
    t.field({
        type: FormTemplateType,
        args: {
            input: t.arg({ type: CreateFormTemplateInput, required: true }),
        },
        authScopes: {
            loggedIn: true,
        },
        resolve: async (_, args, context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            const templateId = crypto.randomUUID();

            // Create the form template
            await context.db.insert(tables.formTemplates).values({
                id: templateId,
                name: args.input.name,
                description: args.input.description || null,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastModifiedBy: context.user.id,
                version: 1,
            });

            // Create the form template fields
            if (args.input.fields.length > 0) {
                await context.db.insert(tables.formTemplateFields).values(
                    args.input.fields.map(field => ({
                        id: crypto.randomUUID(),
                        templateId: templateId,
                        name: field.name,
                        type: field.type,
                        required: field.required,
                        order: field.order,
                        options: field.options || null,
                        defaultValue: field.defaultValue || null,
                        validationRules: field.validationRules || null,
                    }))
                );
            }

            // Return the created template
            const newTemplate = await context.db.query.formTemplates.findFirst({
                where: { id: templateId },
            });

            if (!newTemplate) {
                throw new Error('Failed to create form template');
            }

            return newTemplate;
        },
    })
);

// Mutation to update a form template
builder.mutationField('updateFormTemplate', (t) =>
    t.field({
        type: FormTemplateType,
        args: {
            id: t.arg.string({ required: true }),
            input: t.arg({ type: UpdateFormTemplateInput, required: true }),
        },
        authScopes: {
            loggedIn: true,
        },
        resolve: async (_, args, context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            // Check if template exists
            const template = await context.db.query.formTemplates.findFirst({
                where: { id: args.id },
            });

            if (!template) {
                throw new Error('Form template not found');
            }

            // Update template basic info
            const updateValues: Record<string, any> = {
                updatedAt: new Date(),
                lastModifiedBy: context.user.id,
                version: template.version + 1,
            };

            if (args.input.name) updateValues.name = args.input.name;
            if (args.input.description !== undefined) updateValues.description = args.input.description;

            await context.db.update(tables.formTemplates)
                .set(updateValues)
                .where(eq(tables.formTemplates.id, args.id));

            // Update fields if provided
            if (args.input.fields && args.input.fields.length > 0) {
                // Delete existing fields
                await context.db.delete(tables.formTemplateFields)
                    .where(eq(tables.formTemplateFields.templateId, args.id));

                // Add new fields
                await context.db.insert(tables.formTemplateFields).values(
                    args.input.fields.map(field => ({
                        id: crypto.randomUUID(),
                        templateId: args.id,
                        name: field.name,
                        type: field.type,
                        required: field.required,
                        order: field.order,
                        options: field.options || null,
                        defaultValue: field.defaultValue || null,
                        validationRules: field.validationRules || null,
                    }))
                );
            }

            // Return the updated template
            const updatedTemplate = await context.db.query.formTemplates.findFirst({
                where: { id: args.id },
            });

            if (!updatedTemplate) {
                throw new Error('Failed to update form template');
            }

            return updatedTemplate;
        },
    })
);

// Mutation to delete a form template
builder.mutationField('deleteFormTemplate', (t) =>
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

            // Check if template exists
            const template = await context.db.query.formTemplates.findFirst({
                where: { id: args.id },
            });

            if (!template) {
                throw new Error('Form template not found');
            }

            // Delete all template fields
            await context.db.delete(tables.formTemplateFields)
                .where(eq(tables.formTemplateFields.templateId, args.id));

            // Delete the template
            await context.db.delete(tables.formTemplates)
                .where(eq(tables.formTemplates.id, args.id));

            return true;
        },
    })
); 