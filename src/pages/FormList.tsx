import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Plus, Search, Trash2 } from 'lucide-react';
import { useGetForms } from '../hooks/useFormManagement';

export default function FormList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: forms = [], isLoading, error } = useGetForms();

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_changes':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
        <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:flex-row">
          <div className="relative rounded-md shadow-sm">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search forms"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/forms/new" className="btn btn-primary">
            <Plus className="mr-1 w-4 h-4" />
            Create Form
          </Link>
        </div>
      </div>

      <div className="flow-root mt-8">
        <div className="overflow-x-auto -mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block py-2 min-w-full align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden ring-1 ring-black ring-opacity-5 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form) => (
                    <tr key={form.id}>
                      <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                        <div className="flex items-center">
                          <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gray-100 rounded-full">
                            <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <Link to={`/forms/${form.id}`} className="font-medium text-blue-600 hover:text-blue-900">
                              {form.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(form.status)}`}>
                          {form.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative py-4 pr-4 pl-3 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                        <Link to={`/forms/${form.id}`} className="mr-4 text-blue-600 hover:text-blue-900">
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
