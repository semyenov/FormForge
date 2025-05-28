import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { gql } from "graphql-request";

interface Organization {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  createdAt: Date;
}

async function fetchOrganizations() {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetOrganizations {
          organizations {
            id
            name
            slug
            logo
            createdAt
          }
        }
      `,
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.organizations;
}

async function setActiveOrganization(organizationId: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: gql`
        mutation SetActiveOrganization($organizationId: String!) {
          setActiveOrganization(organizationId: $organizationId)
        }
      `,
      variables: {
        organizationId,
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.setActiveOrganization;
}

async function createOrganization(name: string, slug?: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        mutation CreateOrganization($input: CreateOrganizationInput!) {
          createOrganization(input: $input) {
            id
            name
            slug
          }
        }
      `,
      variables: {
        input: {
          name,
          slug,
        },
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.createOrganization;
}

export default function OrganizationList() {
  const { session, refetchUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const queryClient = useQueryClient();

  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  const createOrgMutation = useMutation({
    mutationFn: (values: { name: string; slug?: string }) =>
      createOrganization(values.name, values.slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsCreating(false);
      setNewOrgName("");
      setNewOrgSlug("");
      toast.success("Organization created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  const setActiveOrgMutation = useMutation({
    mutationFn: setActiveOrganization,
    onSuccess: () => {
      refetchUser();
      toast.success("Active organization updated");
    },
    onError: (error) => {
      toast.error(`Failed to set active organization: ${error.message}`);
    },
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate({
      name: newOrgName,
      slug: newOrgSlug || undefined,
    });
  };

  const handleSetActive = (organizationId: string) => {
    setActiveOrgMutation.mutate(organizationId);
  };

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
              Failed to load organizations:{" "}
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
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
          disabled={isCreating}
        >
          <Plus className="mr-1 w-4 h-4" />
          New Organization
        </button>
      </div>

      {isCreating && (
        <div className="p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow">
          <h2 className="mb-4 text-lg font-medium">Create New Organization</h2>
          <form onSubmit={handleCreateOrg}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="block mt-1 w-full form-input"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug (optional)
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 rounded-l-md border border-r-0 border-gray-300">
                    formforge.com/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    className="block w-full rounded-none rounded-r-md form-input"
                    placeholder="my-organization"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  A unique identifier for your organization's URL
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createOrgMutation.isPending || !newOrgName}
                >
                  {createOrgMutation.isPending
                    ? "Creating..."
                    : "Create Organization"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {organizations?.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {organizations.map((org: Organization) => (
              <li key={org.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {org.logo ? (
                          <img
                            className="w-12 h-12 rounded"
                            src={org.logo}
                            alt={org.name}
                          />
                        ) : (
                          <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">
                          {org.name}
                        </div>
                        {org.slug && (
                          <div className="text-sm text-gray-500">
                            formforge.com/{org.slug}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {session?.activeOrganizationId === org.id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActive(org.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          disabled={setActiveOrgMutation.isPending}
                        >
                          Set Active
                        </button>
                      )}
                      <button className="inline-flex items-center text-gray-400 hover:text-gray-500">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Members
                      </p>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created{" "}
                        {new Date(org.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <Building2 className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No organizations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new organization.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm hover:bg-blue-700"
              >
                <Plus className="mr-2 -ml-1 w-5 h-5" aria-hidden="true" />
                New Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
