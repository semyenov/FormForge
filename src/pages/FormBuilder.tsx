import { useState, useEffect } from 'react';
import { Calendar, FileText, Hash, List, MoveDown, MoveUp, Plus, Save, SquareCheck, TextCursor, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateFormTemplateMutation, useGetFormTemplateQuery } from '../hooks/__generated__/useFormManagement.generated';
import { FormFieldType, FormTemplateField, FormTemplateFieldInput } from '../__generated__/types.generated';

export default function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formName, setFormName] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormTemplateField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);

  // Query the form if we have an ID
  const { data: formData } = useGetFormTemplateQuery({ variables: { id: formId || '' }, skip: !formId });
  const [createFormTemplate] = useCreateFormTemplateMutation();

  const fieldTypeOptions = [
    { value: 'text', label: 'Text', icon: TextCursor },
    { value: 'textarea', label: 'Paragraph', icon: FileText },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'select', label: 'Dropdown', icon: List },
    { value: 'checkbox', label: 'Checkbox', icon: SquareCheck },
  ];

  const addField = (type: FormTemplateField['type']) => {
    const newField: FormTemplateField = {
      id: Date.now().toString(),
      name: `Question ${fields.length + 1}`,
      type,
      required: false,
      options: type === 'select' || type === 'radio' ? 'Option 1,Option 2' : null,
      order: fields.length,
      validationRules: null,
      defaultValue: null,
    };

    setFields([...fields, newField]);
    setIsAddingField(false);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormTemplateField>) => {
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
      setFormName(formData.formTemplate.name);
      setFormDescription(formData.formTemplate.description || '');

      // Convert API form fields to local format
      const convertedFields: FormTemplateField[] = formData.formTemplate.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        required: field.required,
        options: field.options ? field.options : null,
        order: field.order,
        templateId: '',
        validationRules: null,
        defaultValue: null,
      }));

      setFields(convertedFields);
    }
  }, [formData]);

  const saveForm = async () => {
    try {
      // Prepare form fields for API
      const formFields: FormTemplateFieldInput[] = fields.map(field => ({
        name: field.name,
        type: field.type as FormFieldType,
        required: field.required,
        order: field.order,
          options: field.options ? field.options : null,
        templateId: '',
        validationRules: null,
        defaultValue: null,
      }));

      // Call the create form mutation
      const result = await createFormTemplate({
        variables: {
          input: {
            name: formName,
            description: formDescription || null,
            fields: formFields,
          },
        },
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Form Builder</h1>
        <button
          onClick={saveForm}
          className="btn btn-primary"
        >
          <Save className="mr-1 h-4 w-4" />
          Save Form
        </button>
      </div>

      <div className="card mb-6">
        <div className="mb-4">
          <label htmlFor="formName" className="mb-1 block text-sm font-medium text-gray-700">
            Form Name
          </label>
          <input
            type="text"
            id="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="form-input"
            placeholder="Enter form name"
          />
        </div>

        <div>
          <label htmlFor="formDescription" className="mb-1 block text-sm font-medium text-gray-700">
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
        <div key={field.id} className="card mb-4 border-l-4 border-blue-500">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-medium">Field {index + 1}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => moveField(field.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <MoveUp className="h-5 w-5" />
              </button>
              <button
                onClick={() => moveField(field.id, 'down')}
                disabled={index === fields.length - 1}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <MoveDown className="h-5 w-5" />
              </button>
              <button
                onClick={() => removeField(field.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Field Type
            </label>
            <select
              value={field.type}
              onChange={(e) => updateField(field.id, { type: e.target.value as FormTemplateField['type'] })}
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Options
              </label>
              {field.options?.split(',').map((option, optionIndex) => (
                <div key={optionIndex} className="mb-2 flex">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = field.options?.split(',') || [];
                      newOptions[optionIndex] = e.target.value;
                      updateField(field.id, { options: newOptions.join(',') || null });
                    }}
                    className="form-input"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options?.split(',').filter((_, i) => i !== optionIndex);
                      updateField(field.id, { options: newOptions?.join(',') || null });
                    }}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(field.options?.split(',') || []), `Option ${field.options ? field.options.split(',').length + 1 : 0}`];
                  updateField(field.id, { options: newOptions.join(',') || null });
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                disabled={!field.options}
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
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-700">
              Required field
            </label>
          </div>
        </div>
      ))}

      {isAddingField ? (
        <div className="card mb-6">
          <h3 className="mb-4 text-lg font-medium">Select Field Type</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fieldTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => addField(option.value as FormTemplateField['type'])}
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <option.icon className="mb-2 h-8 w-8 text-blue-500" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
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
          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-3 text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Field
        </button>
      )}
    </div>
  );
}
