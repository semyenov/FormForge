import { useState, useEffect } from 'react';
import { Calendar, FileText, Hash, List, MoveDown, MoveUp, Plus, Save, SquareCheck, TextCursor, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateForm, useGetForm, parseOptions, stringifyOptions } from '../hooks/useFormManagement';

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file';

interface FormField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  order: number;
}

export default function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);

  // Query the form if we have an ID
  const { data: formData, isLoading } = useGetForm(formId || '');
  const { mutateAsync: createForm, isPending: isCreating } = useCreateForm();

  const fieldTypeOptions = [
    { value: 'text', label: 'Text', icon: TextCursor },
    { value: 'textarea', label: 'Paragraph', icon: FileText },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: SquareCheck },
  ];

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `Question ${fields.length + 1}`,
      type,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      order: fields.length,
    };

    setFields([...fields, newField]);
    setIsAddingField(false);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if ((direction === 'up' && index === 0) ||
        (direction === 'down' && index === fields.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[newIndex];
    newFields[newIndex] = temp;

    // Update order property
    newFields.forEach((field, idx) => {
      field.order = idx;
    });

    setFields(newFields);
  };

  // Load form data if editing an existing form
  useEffect(() => {
    if (formData) {
      setFormTitle(formData.title);
      setFormDescription(formData.description || '');

      // Convert API form fields to local format
      const convertedFields = formData.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as FieldType,
        required: field.required,
        options: field.options ? parseOptions(field.options) : undefined,
        order: field.order,
      }));

      setFields(convertedFields);
    }
  }, [formData]);

  const saveForm = async () => {
    try {
      // Prepare form fields for API
      const formFields = fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required,
        order: field.order,
        options: field.options ? stringifyOptions(field.options) : undefined,
      }));

      // Call the create form mutation
      const result = await createForm({
        title: formTitle,
        description: formDescription || undefined,
        fields: formFields,
      });

      // Navigate to the form list after successful creation
      navigate('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Form Builder</h1>
        <button
          onClick={saveForm}
          className="btn btn-primary"
        >
          <Save className="mr-1 w-4 h-4" />
          Save Form
        </button>
      </div>

      <div className="mb-6 card">
        <div className="mb-4">
          <label htmlFor="formTitle" className="block mb-1 text-sm font-medium text-gray-700">
            Form Title
          </label>
          <input
            type="text"
            id="formTitle"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="form-input"
            placeholder="Enter form title"
          />
        </div>

        <div>
          <label htmlFor="formDescription" className="block mb-1 text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="form-input"
            rows={3}
            placeholder="Enter form description"
          />
        </div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="mb-4 border-l-4 border-blue-500 card">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Field {index + 1}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => moveField(field.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <MoveUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => moveField(field.id, 'down')}
                disabled={index === fields.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <MoveDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => removeField(field.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Question / Label
            </label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(field.id, { name: e.target.value })}
              className="form-input"
              placeholder="Enter question or label"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Field Type
            </label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
              className="form-input"
            >
              {fieldTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {(field.type === 'select' || field.type === 'radio') && field.options && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Options
              </label>
              {field.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[optionIndex] = e.target.value;
                      updateField(field.id, { options: newOptions });
                    }}
                    className="form-input"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options!.filter((_, i) => i !== optionIndex);
                      updateField(field.id, { options: newOptions });
                    }}
                    className="p-2 ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...field.options!, `Option ${field.options!.length + 1}`];
                  updateField(field.id, { options: newOptions });
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor={`required-${field.id}`} className="block ml-2 text-sm text-gray-700">
              Required field
            </label>
          </div>
        </div>
      ))}

      {isAddingField ? (
        <div className="mb-6 card">
          <h3 className="mb-4 text-lg font-medium">Select Field Type</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fieldTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => addField(option.value as FieldType)}
                className="flex flex-col justify-center items-center p-4 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
              >
                <option.icon className="mb-2 w-8 h-8 text-blue-500" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsAddingField(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingField(true)}
          className="flex justify-center items-center py-3 w-full text-gray-500 rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-blue-500 hover:text-blue-500"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Field
        </button>
      )}
    </div>
  );
}
