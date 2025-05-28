import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export default function FormSubmission() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch the form from the API
    // For this example, we'll use mock data
    const mockForm: Form = {
      id: formId || '1',
      title: 'Employee Onboarding Form',
      description: 'Please complete this form to begin the onboarding process.',
      fields: [
        {
          id: '1',
          name: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          id: '2',
          name: 'Email Address',
          type: 'text',
          required: true,
        },
        {
          id: '3',
          name: 'Department',
          type: 'select',
          required: true,
          options: ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance'],
        },
        {
          id: '4',
          name: 'Start Date',
          type: 'date',
          required: true,
        },
        {
          id: '5',
          name: 'Comments or Questions',
          type: 'textarea',
          required: false,
        },
        {
          id: '6',
          name: 'I agree to the company policies',
          type: 'checkbox',
          required: true,
        },
      ],
    };

    setForm(mockForm);
    
    // Initialize form values
    const initialValues: Record<string, any> = {};
    mockForm.fields.forEach(field => {
      initialValues[field.id] = field.type === 'checkbox' ? false : '';
    });
    setFormValues(initialValues);
  }, [formId]);

  const handleChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields: string[] = [];
    form?.fields.forEach(field => {
      if (field.required) {
        const value = formValues[field.id];
        if (value === '' || value === false || value === undefined) {
          missingFields.push(field.name);
        }
      }
    });
    
    if (missingFields.length > 0) {
      toast.error(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formValues);
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
    }, 1500);
  };

  if (!form) {
    return <div className="flex justify-center items-center h-64">Loading form...</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-xl font-semibold text-gray-900">Form Submitted</h2>
          <p className="mt-2 text-gray-500">Thank you for your submission!</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/forms')}
              className="btn btn-primary"
            >
              Return to Forms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-gray-600">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map(field => (
          <div key={field.id} className="field-container">
            <label htmlFor={field.id} className="field-label">
              {field.name} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                id={field.id}
                className="field-input"
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                id={field.id}
                className="field-input"
                rows={4}
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                id={field.id}
                className="field-input"
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'date' && (
              <input
                type="date"
                id={field.id}
                className="field-input"
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                id={field.id}
                className="field-input"
                value={formValues[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {field.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={field.id}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formValues[field.id] || false}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                />
                <label htmlFor={field.id} className="ml-2 block text-sm text-gray-700">
                  I agree
                </label>
              </div>
            )}

            {field.type === 'file' && (
              <div className="mt-2">
                <label 
                  htmlFor={field.id}
                  className="group relative flex justify-center px-6 py-5 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500"
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  <input 
                    id={field.id} 
                    name={field.id} 
                    type="file" 
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleChange(field.id, e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {formValues[field.id] && (
                  <div className="mt-2 text-sm text-gray-500">
                    Selected file: {formValues[field.id].name}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
}
