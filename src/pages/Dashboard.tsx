import { Link } from 'react-router-dom';
import { CircleAlert, FileSpreadsheet, Plus, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Forms', value: '12', icon: FileSpreadsheet, color: 'bg-blue-500' },
    { name: 'Forms Submitted', value: '38', icon: UserCheck, color: 'bg-green-500' },
    { name: 'Forms Pending Review', value: '5', icon: CircleAlert, color: 'bg-amber-500' }
  ];

  const recentForms = [
    { id: '1', title: 'Employee Onboarding', status: 'draft', updatedAt: '2 hours ago' },
    { id: '2', title: 'Project Assessment', status: 'approved', updatedAt: '1 day ago' },
    { id: '3', title: 'Client Feedback', status: 'under_review', updatedAt: '3 days ago' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link to="/forms/new" className="btn btn-primary">
          <Plus className="mr-1 w-4 h-4" />
          Create Form
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Welcome back, {user?.name}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Forms</h2>
        <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow">
          <ul role="list" className="divide-y divide-gray-200">
            {recentForms.map((form) => (
              <li key={form.id}>
                <Link to={`/forms/${form.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">{form.title}</p>
                      <div className="flex flex-shrink-0 ml-2">
                        <p
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
                            ${form.status === 'approved' ? 'bg-green-100 text-green-800' :
                              form.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                        >
                          {form.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <FileSpreadsheet className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          Form
                        </p>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                        <p>Updated {form.updatedAt}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
