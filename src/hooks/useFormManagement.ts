import { gql } from '@apollo/client';

// GraphQL Queries
export const GET_FORM_TEMPLATES = gql`
  query GetFormTemplates {
    formTemplates {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_FORM_TEMPLATE = gql`
  query GetFormTemplate($id: String!) {
    formTemplate(id: $id) {
      id
      name
      description
      version
      fields {
        id
        name
        type
        required
        order
        options
      }
    }
  }
`;

// GraphQL Mutations
export const CREATE_FORM_TEMPLATE = gql`
  mutation CreateFormTemplate($input: CreateFormTemplateInput!) {
    createFormTemplate(input: $input) {
      name
      description
      fields {
        id
        name
        type
        required
        order
        options
      }
    }
  }
`;

export * from './__generated__/useFormManagement.generated';