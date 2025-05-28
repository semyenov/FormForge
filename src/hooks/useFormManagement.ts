import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gql } from 'graphql-request';
import graphqlClient from './useGraphqlClient';

// GraphQL Queries
const GET_FORMS = gql`
  query GetForms {
    forms {
      id
      title
      description
      status
      createdAt
      updatedAt
    }
  }
`;

const GET_FORM = gql`
  query GetForm($id: String!) {
    form(id: $id) {
      id
      title
      description
      status
      createdAt
      updatedAt
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
const CREATE_FORM = gql`
  mutation CreateForm($input: CreateFormInput!) {
    createForm(input: $input) {
      id
      title
      description
    }
  }
`;

// Types
interface Form {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FormDetail extends Form {
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  order: number;
  options?: string;
}

interface CreateFormInput {
  title: string;
  description?: string;
  fields: {
    name: string;
    type: string;
    required: boolean;
    order: number;
    options?: string;
  }[];
}

export function useGetForms() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const data = await graphqlClient.request<{ forms: Form[] }>(GET_FORMS);
      return data.forms as unknown as Form[];
    },
  });
}

export function useGetForm(formId: string) {
  return useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      if (!formId) return null;
      const data = await graphqlClient.request<{ form: FormDetail }>(GET_FORM, { id: formId });
      return data.form as unknown as FormDetail;
    },
    enabled: !!formId,
  });
}

export function useCreateForm() {
  return useMutation({
    mutationFn: async (input: CreateFormInput) => {
      const data = await graphqlClient.request<{ createForm: Form }>(CREATE_FORM, { input });
      return data.createForm as unknown as Form;
    },
    onSuccess: () => {
      toast.success('Form created successfully!');
    },
    onError: (error) => {
      console.error('Error creating form:', error);
      toast.error('Failed to create form. Please try again.');
    },
  });
}

// Helper function to parse options string into array
export function parseOptions(optionsString?: string): string[] {
  if (!optionsString) return [];
  try {
    return JSON.parse(optionsString);
  } catch {
    return optionsString.split(',').map(opt => opt.trim());
  }
}

// Helper function to stringify options array
export function stringifyOptions(options: string[]): string {
  return JSON.stringify(options);
}
