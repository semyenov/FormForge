import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, FileText, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface ReviewFlow {
  id: string;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
  formId: string;
  form: {
    id: string;
    title: string;
  };
}

async function fetchReviewFlows(organizationId: string, status?: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
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
      `,
      variables: {
        organizationId,
        status: status || null,
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.organizationReviewFlows;
}

async function updateReviewFlowStatus(id: string, status: "open" | "closed") {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        mutation UpdateReviewFlow($id: String!, $input: UpdateReviewFlowInput!) {
          updateReviewFlow(id: $id, input: $input) {
            id
            status
          }
        }
      `,
      variables: {
        id,
        input: {
          status,
        },
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.updateReviewFlow;
}

export default function ReviewList() {
  const { session } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const organizationId = session?.activeOrganizationId;

  const {
    data: reviewFlows,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviewFlows", organizationId, statusFilter],
    queryFn: () =>
      organizationId
        ? fetchReviewFlows(organizationId, statusFilter)
        : Promise.resolve([]),
    enabled: !!organizationId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: { id: string; status: "open" | "closed" }) =>
      updateReviewFlowStatus(params.id, params.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewFlows"] });
      toast.success("Review status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleStatusChange = (id: string, newStatus: "open" | "closed") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  if (!organizationId) {
    return (
      <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You need to select an active organization to view review flows.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load review flows:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Review Flows</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <button
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === undefined ? "open" : undefined
                )
              }
              className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              <Filter className="mr-1 w-4 h-4" />
              {statusFilter ? `Showing ${statusFilter}` : "All statuses"}
            </button>
            {statusFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => setStatusFilter(undefined)}
                    className="block px-4 py-2 w-full text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("open")}
                    className="block px-4 py-2 w-full text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setStatusFilter("closed")}
                    className="block px-4 py-2 w-full text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Closed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {reviewFlows?.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {reviewFlows.map((review: ReviewFlow) => (
              <li key={review.id}>
                <Link
                  to={`/reviews/${review.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="mr-2 w-5 h-5 text-blue-500" />
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {review.form.title}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {review.status === "open" ? (
                            <>
                              <Clock className="mr-1 w-3 h-3" />
                              Open
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1 w-3 h-3" />
                              Closed
                            </>
                          )}
                        </span>
                        <div className="ml-2">
                          {review.status === "open" ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleStatusChange(review.id, "closed");
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Close
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleStatusChange(review.id, "open");
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Review flow
                        </p>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created{" "}
                          {new Date(review.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <Clock className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No review flows
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no review flows matching your filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
