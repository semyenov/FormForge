import * as Types from '../../__generated__/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFormTemplatesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFormTemplatesQuery = { __typename?: 'Query', formTemplates: Array<{ __typename?: 'FormTemplate', id: string, name: string, description?: string | null, createdAt: any, updatedAt: any }> };

export type GetFormTemplateQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type GetFormTemplateQuery = { __typename?: 'Query', formTemplate: { __typename?: 'FormTemplate', id: string, name: string, description?: string | null, version: number, fields: Array<{ __typename?: 'FormTemplateField', id: string, name: string, type: Types.FormFieldType, required: boolean, order: number, options?: string | null }> } };

export type CreateFormTemplateMutationVariables = Types.Exact<{
  input: Types.CreateFormTemplateInput;
}>;


export type CreateFormTemplateMutation = { __typename?: 'Mutation', createFormTemplate: { __typename?: 'FormTemplate', name: string, description?: string | null, fields: Array<{ __typename?: 'FormTemplateField', id: string, name: string, type: Types.FormFieldType, required: boolean, order: number, options?: string | null }> } };


export const GetFormTemplatesDocument = gql`
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

/**
 * __useGetFormTemplatesQuery__
 *
 * To run a query within a React component, call `useGetFormTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFormTemplatesQuery(baseOptions?: Apollo.QueryHookOptions<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>(GetFormTemplatesDocument, options);
      }
export function useGetFormTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>(GetFormTemplatesDocument, options);
        }
export function useGetFormTemplatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>(GetFormTemplatesDocument, options);
        }
export type GetFormTemplatesQueryHookResult = ReturnType<typeof useGetFormTemplatesQuery>;
export type GetFormTemplatesLazyQueryHookResult = ReturnType<typeof useGetFormTemplatesLazyQuery>;
export type GetFormTemplatesSuspenseQueryHookResult = ReturnType<typeof useGetFormTemplatesSuspenseQuery>;
export type GetFormTemplatesQueryResult = Apollo.QueryResult<GetFormTemplatesQuery, GetFormTemplatesQueryVariables>;
export const GetFormTemplateDocument = gql`
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

/**
 * __useGetFormTemplateQuery__
 *
 * To run a query within a React component, call `useGetFormTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormTemplateQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFormTemplateQuery(baseOptions: Apollo.QueryHookOptions<GetFormTemplateQuery, GetFormTemplateQueryVariables> & ({ variables: GetFormTemplateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormTemplateQuery, GetFormTemplateQueryVariables>(GetFormTemplateDocument, options);
      }
export function useGetFormTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormTemplateQuery, GetFormTemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormTemplateQuery, GetFormTemplateQueryVariables>(GetFormTemplateDocument, options);
        }
export function useGetFormTemplateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFormTemplateQuery, GetFormTemplateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFormTemplateQuery, GetFormTemplateQueryVariables>(GetFormTemplateDocument, options);
        }
export type GetFormTemplateQueryHookResult = ReturnType<typeof useGetFormTemplateQuery>;
export type GetFormTemplateLazyQueryHookResult = ReturnType<typeof useGetFormTemplateLazyQuery>;
export type GetFormTemplateSuspenseQueryHookResult = ReturnType<typeof useGetFormTemplateSuspenseQuery>;
export type GetFormTemplateQueryResult = Apollo.QueryResult<GetFormTemplateQuery, GetFormTemplateQueryVariables>;
export const CreateFormTemplateDocument = gql`
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
export type CreateFormTemplateMutationFn = Apollo.MutationFunction<CreateFormTemplateMutation, CreateFormTemplateMutationVariables>;

/**
 * __useCreateFormTemplateMutation__
 *
 * To run a mutation, you first call `useCreateFormTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateFormTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createFormTemplateMutation, { data, loading, error }] = useCreateFormTemplateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateFormTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateFormTemplateMutation, CreateFormTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateFormTemplateMutation, CreateFormTemplateMutationVariables>(CreateFormTemplateDocument, options);
      }
export type CreateFormTemplateMutationHookResult = ReturnType<typeof useCreateFormTemplateMutation>;
export type CreateFormTemplateMutationResult = Apollo.MutationResult<CreateFormTemplateMutation>;
export type CreateFormTemplateMutationOptions = Apollo.BaseMutationOptions<CreateFormTemplateMutation, CreateFormTemplateMutationVariables>;