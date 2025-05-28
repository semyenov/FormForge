import { defineRelations } from "drizzle-orm";

import {
  comments,
  formFields,
  formHistories,
  formTemplateFields,
  formTemplates,
  forms,
  reviewFlows,
} from "./app";

import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  users,
} from "./auth";

export default defineRelations(
  {
    users,
    accounts,
    sessions,
    forms,
    formFields,
    organizations,
    members,
    formTemplates,
    formTemplateFields,
    formHistories,
    reviewFlows,
    comments,
    invitations,
  },
  (r) => ({
    users: {
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
        alias: "AccountToUser"
      }),
      sessions: r.many.sessions({
        from: r.users.id,
        to: r.sessions.userId,
        alias: "SessionToUser"
      }),
      members: r.many.members({
        from: r.users.id,
        to: r.members.userId,
        alias: "MemberToUser"
      }),
    },
    sessions: {
      user: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
        alias: "SessionToUser"
      }),
    },
    accounts: {
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
        alias: "AccountToUser"
      }),
    },
    forms: {
      fields: r.many.formFields({
        from: r.forms.id,
        to: r.formFields.formId,
        alias: "FormToFormField"
      }),
      organization: r.one.organizations({
        from: r.forms.organizationId,
        to: r.organizations.id,
        alias: "FormToOrganization"
      }),
      template: r.one.formTemplates({
        from: r.forms.templateId,
        to: r.formTemplates.id,
        alias: "FormToTemplate",
      }),
      history: r.many.formHistories({
        from: r.forms.id,
        to: r.formHistories.formId,
        alias: "FormToHistory"
      }),
      reviewFlow: r.many.reviewFlows({
        from: r.forms.id,
        to: r.reviewFlows.formId,
        alias: "FormToReviewFlow"
      }),
    },
    formFields: {
      form: r.one.forms({
        from: r.formFields.formId,
        to: r.forms.id,
        alias: "FormToFormField"
      }),
      comments: r.many.comments({
        from: r.formFields.id,
        to: r.comments.formFieldId,
        alias: "FormFieldToComment",
      }),
    },
    formTemplates: {
      fields: r.many.formTemplateFields({
        from: r.formTemplates.id,
        to: r.formTemplateFields.templateId,
        alias: "TemplateToField"
      }),
      forms: r.many.forms({
        from: r.formTemplates.id,
        to: r.forms.templateId,
        alias: "FormToTemplate",
      }),
    },
    formTemplateFields: {
      template: r.one.formTemplates({
        from: r.formTemplateFields.templateId,
        to: r.formTemplates.id,
        alias: "TemplateToField"
      }),
    },
    organizations: {
      members: r.many.members({
        from: r.organizations.id,
        to: r.members.organizationId,
        alias: "OrganizationToMember"
      }),
      forms: r.many.forms({
        from: r.organizations.id,
        to: r.forms.organizationId,
        alias: "FormToOrganization"
      }),
      reviewFlows: r.many.reviewFlows({
        from: r.organizations.id,
        to: r.reviewFlows.organizationId,
        alias: "OrganizationToReviewFlow"
      }),
      invitations: r.many.invitations({
        from: r.organizations.id,
        to: r.invitations.organizationId,
        alias: "OrganizationToInvitation"
      }),
    },
    members: {
      user: r.one.users({
        from: r.members.userId,
        to: r.users.id,
        alias: "MemberToUser"
      }),
      organization: r.one.organizations({
        from: r.members.organizationId,
        to: r.organizations.id,
        alias: "OrganizationToMember"
      }),
      comments: r.many.comments({
        from: r.members.id,
        to: r.comments.memberId,
        alias: "MemberToComment"
      }),
    },
    reviewFlows: {
      form: r.one.forms({
        from: r.reviewFlows.formId,
        to: r.forms.id,
        alias: "FormToReviewFlow"
      }),
      organization: r.one.organizations({
        from: r.reviewFlows.organizationId,
        to: r.organizations.id,
        alias: "OrganizationToReviewFlow"
      }),
      comments: r.many.comments({
        from: r.reviewFlows.id,
        to: r.comments.reviewFlowId,
        alias: "ReviewFlowToComment"
      }),
    },
    comments: {
      member: r.one.members({
        from: r.comments.memberId,
        to: r.members.id,
        alias: "MemberToComment"
      }),
      reviewFlow: r.one.reviewFlows({
        from: r.comments.reviewFlowId,
        to: r.reviewFlows.id,
        alias: "ReviewFlowToComment"
      }),
      formField: r.one.formFields({
        from: r.comments.formFieldId,
        to: r.formFields.id,
        alias: "FormFieldToComment",
      }),
    },
    invitations: {
      organization: r.one.organizations({
        from: r.invitations.organizationId,
        to: r.organizations.id,
        alias: "OrganizationToInvitation"
      }),
    },
  })
);
