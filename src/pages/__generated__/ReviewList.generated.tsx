import * as Types from '../../__generated__/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetReviewFlowsQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['String']['input'];
  status?: Types.InputMaybe<Types.ReviewFlowStatus>;
}>;


export type GetReviewFlowsQuery = { __typename?: 'Query', organizationReviewFlows: Array<{ __typename?: 'ReviewFlow', id: string, status: Types.ReviewFlowStatus, createdAt: any, updatedAt: any, formId: string, form: { __typename?: 'Form', id: string, title: string } }> };

export type UpdateReviewFlowMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.UpdateReviewFlowInput;
}>;


export type UpdateReviewFlowMutation = { __typename?: 'Mutation', updateReviewFlow: { __typename?: 'ReviewFlow', id: string, status: Types.ReviewFlowStatus } };

export type GetReviewFlowQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type GetReviewFlowQuery = { __typename?: 'Query', reviewFlow: { __typename?: 'ReviewFlow', id: string, status: Types.ReviewFlowStatus, createdAt: any, updatedAt: any, formId: string, form: { __typename?: 'Form', id: string, title: string } } };


export const GetReviewFlowsDocument = gql`
    query GetReviewFlows($organizationId: String!, $status: ReviewFlowStatus) {
  organizationReviewFlows(organizationId: $organizationId, status: $status) {
    id
    status
    createdAt
    updatedAt
    formId
    form {
      id
      title
    }
  }
}
    `;

/**
 * __useGetReviewFlowsQuery__
 *
 * To run a query within a React component, call `useGetReviewFlowsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReviewFlowsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReviewFlowsQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetReviewFlowsQuery(baseOptions: Apollo.QueryHookOptions<GetReviewFlowsQuery, GetReviewFlowsQueryVariables> & ({ variables: GetReviewFlowsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>(GetReviewFlowsDocument, options);
      }
export function useGetReviewFlowsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>(GetReviewFlowsDocument, options);
        }
export function useGetReviewFlowsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>(GetReviewFlowsDocument, options);
        }
export type GetReviewFlowsQueryHookResult = ReturnType<typeof useGetReviewFlowsQuery>;
export type GetReviewFlowsLazyQueryHookResult = ReturnType<typeof useGetReviewFlowsLazyQuery>;
export type GetReviewFlowsSuspenseQueryHookResult = ReturnType<typeof useGetReviewFlowsSuspenseQuery>;
export type GetReviewFlowsQueryResult = Apollo.QueryResult<GetReviewFlowsQuery, GetReviewFlowsQueryVariables>;
export const UpdateReviewFlowDocument = gql`
    mutation UpdateReviewFlow($id: String!, $input: UpdateReviewFlowInput!) {
  updateReviewFlow(id: $id, input: $input) {
    id
    status
  }
}
    `;
export type UpdateReviewFlowMutationFn = Apollo.MutationFunction<UpdateReviewFlowMutation, UpdateReviewFlowMutationVariables>;

/**
 * __useUpdateReviewFlowMutation__
 *
 * To run a mutation, you first call `useUpdateReviewFlowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateReviewFlowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateReviewFlowMutation, { data, loading, error }] = useUpdateReviewFlowMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateReviewFlowMutation(baseOptions?: Apollo.MutationHookOptions<UpdateReviewFlowMutation, UpdateReviewFlowMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateReviewFlowMutation, UpdateReviewFlowMutationVariables>(UpdateReviewFlowDocument, options);
      }
export type UpdateReviewFlowMutationHookResult = ReturnType<typeof useUpdateReviewFlowMutation>;
export type UpdateReviewFlowMutationResult = Apollo.MutationResult<UpdateReviewFlowMutation>;
export type UpdateReviewFlowMutationOptions = Apollo.BaseMutationOptions<UpdateReviewFlowMutation, UpdateReviewFlowMutationVariables>;
export const GetReviewFlowDocument = gql`
    query GetReviewFlow($id: String!) {
  reviewFlow(id: $id) {
    id
    status
    createdAt
    updatedAt
    formId
    form {
      id
      title
    }
  }
}
    `;

/**
 * __useGetReviewFlowQuery__
 *
 * To run a query within a React component, call `useGetReviewFlowQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReviewFlowQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReviewFlowQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetReviewFlowQuery(baseOptions: Apollo.QueryHookOptions<GetReviewFlowQuery, GetReviewFlowQueryVariables> & ({ variables: GetReviewFlowQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReviewFlowQuery, GetReviewFlowQueryVariables>(GetReviewFlowDocument, options);
      }
export function useGetReviewFlowLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReviewFlowQuery, GetReviewFlowQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReviewFlowQuery, GetReviewFlowQueryVariables>(GetReviewFlowDocument, options);
        }
export function useGetReviewFlowSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReviewFlowQuery, GetReviewFlowQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReviewFlowQuery, GetReviewFlowQueryVariables>(GetReviewFlowDocument, options);
        }
export type GetReviewFlowQueryHookResult = ReturnType<typeof useGetReviewFlowQuery>;
export type GetReviewFlowLazyQueryHookResult = ReturnType<typeof useGetReviewFlowLazyQuery>;
export type GetReviewFlowSuspenseQueryHookResult = ReturnType<typeof useGetReviewFlowSuspenseQuery>;
export type GetReviewFlowQueryResult = Apollo.QueryResult<GetReviewFlowQuery, GetReviewFlowQueryVariables>;