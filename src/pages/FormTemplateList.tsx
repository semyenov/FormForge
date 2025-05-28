import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface FormTemplate {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

async function fetchFormTemplates() {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetFormTemplates {
          formTemplates {
            id
            name
            description
            createdAt
            updatedAt
            version
          }
        }
      `,
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.formTemplates;
}

async function deleteFormTemplate(id: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        mutation DeleteFormTemplate($id: String!) {
          deleteFormTemplate(id: $id)
        }
      `,
      variables: {
        id,
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data.deleteFormTemplate;
}

export default function FormTemplateList() {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["formTemplates"],
    queryFn: fetchFormTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formTemplates"] });
      toast.success("Template deleted successfully");
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteMutation.mutate(confirmDelete);
    }
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
              Failed to load templates:{" "}
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
        <h1 className="text-2xl font-semibold text-gray-900">Form Templates</h1>
        <Link to="/templates/new" className="btn btn-primary">
          <Plus className="mr-1 w-4 h-4" />
          New Template
        </Link>
      </div>

      {confirmDelete && (
        <div className="flex overflow-y-auto fixed inset-0 z-50 justify-center items-center w-full h-full bg-gray-600 bg-opacity-50">
          <div className="relative p-5 mx-auto w-96 bg-white rounded-md border shadow-lg">
            <div className="mt-3 text-center">
              <div className="flex justify-center items-center mx-auto w-12 h-12 bg-red-100 rounded-full">
                <Trash className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Delete Template
              </h3>
              <div className="px-7 py-3 mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this template? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        {templates?.length > 0 ? (
          <ul role="list" className="divide-y divide-gray-200">
            {templates.map((template: FormTemplate) => (
              <li key={template.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 w-5 h-5 text-blue-500" />
                        <Link
                          to={`/templates/${template.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {template.name}
                        </Link>
                      </div>
                      {template.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/templates/${template.id}/edit`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(template.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Version {template.version}
                      </p>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                      <p>
                        Updated{" "}
                        {new Date(template.updatedAt).toLocaleDateString(
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
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <FileText className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No templates
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new form template.
            </p>
            <div className="mt-6">
              <Link
                to="/templates/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm hover:bg-blue-700"
              >
                <Plus className="mr-2 -ml-1 w-5 h-5" aria-hidden="true" />
                New Template
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
