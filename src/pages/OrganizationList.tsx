import { useState } from "react";
import { Building2, Plus, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCreateOrganizationMutation, useGetOrganizationsQuery, useSetActiveOrganizationMutation } from "./__generated__/OrganizationList.generated";

export default function OrganizationList() {
  const { session, refetchUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [nameError, setNameError] = useState("");

  const { data: organizationsData } = useGetOrganizationsQuery();
  const organizations = organizationsData?.organizations;

  const [createOrgMutation, { loading: createOrgLoading, error: createOrgError }] = useCreateOrganizationMutation({
    onCompleted: (newOrg) => {
      // Set the new organization as active
      setActiveOrgMutation({
        variables: {
          organizationId: newOrg.createOrganization.id,
        },
        onCompleted: () => {
          toast.success(`Organization "${newOrg.createOrganization.name}" created and set as active`);
          refetchUser();
        }
      });

      setIsCreating(false);
      setNewOrgName("");
      setNewOrgSlug("");
      setNameError("");
      setSlugError("");
    },
    onError: (error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  const [setActiveOrgMutation, { loading: setActiveOrgLoading, error: setActiveOrgError }] = useSetActiveOrganizationMutation({
    onCompleted: () => {
      refetchUser();
      toast.success("Active organization updated");
    },
    onError: (error) => {
      toast.error(`Failed to set active organization: ${error.message}`);
    },
  });

  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!newOrgName.trim()) {
      setNameError("Organization name is required");
      isValid = false;
    } else if (newOrgName.length < 2) {
      setNameError("Name must be at least 2 characters long");
      isValid = false;
    } else {
      setNameError("");
    }

    // Validate slug if provided
    if (newOrgSlug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(newOrgSlug)) {
        setSlugError("Slug can only contain lowercase letters, numbers, and hyphens");
        isValid = false;
      } else {
        setSlugError("");
      }
    } else {
      setSlugError("");
    }

    return isValid;
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createOrgMutation({
        variables: {
          input: {
            name: newOrgName,
            slug: newOrgSlug || undefined,
          },
        },
      });
    }
  };

  const handleSetActive = (organizationId: string) => {
    setActiveOrgMutation({
      variables: {
        organizationId,
      },
    });
  };

  if (createOrgLoading || setActiveOrgLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (createOrgError || setActiveOrgError) {
    return (
      <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
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
              {createOrgError instanceof Error ? createOrgError.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
          disabled={isCreating}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Organization
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
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
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    if (e.target.value.trim()) setNameError("");
                  }}
                  className={`block mt-1 w-full form-input ${nameError ? "border-red-500" : ""}`}
                  required
                />
                {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug (optional)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    formforge.com/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={newOrgSlug}
                    onChange={(e) => {
                      setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setSlugError("");
                    }}
                    className={`block w-full rounded-none rounded-r-md form-input ${slugError ? "border-red-500" : ""}`}
                    placeholder="my-organization"
                  />
                </div>
                {slugError ? (
                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    A unique identifier for your organization's URL
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewOrgName("");
                    setNewOrgSlug("");
                    setNameError("");
                    setSlugError("");
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createOrgLoading || !newOrgName}
                >
                  {createOrgLoading
                    ? "Creating..."
                    : "Create Organization"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {organizations && organizations.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {organizations.map((org) => (
              <li key={org.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {org.logo ? (
                          <img
                            className="h-12 w-12 rounded"
                            src={org.logo}
                            alt={org.name}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-100">
                            <Building2 className="h-6 w-6 text-blue-600" />
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
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActive(org.id)}
                          className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          disabled={setActiveOrgLoading}
                        >
                          Set Active
                        </button>
                      )}
                      <button className="inline-flex items-center text-gray-400 hover:text-gray-500">
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                        Members
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
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
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No organizations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new organization.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
