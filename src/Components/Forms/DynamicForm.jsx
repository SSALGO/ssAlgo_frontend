import React, { useState, useEffect, useCallback } from "react";
import { postData, fetchGetData, postFormData } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OptionGrid, { tableFields } from '../OptionGrid/OptionGrid';


const MultiSelect = ({ limit, value = [], onChange, name }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);

  const searchData = useCallback(async (query) => {
    if (query.length >= 3) {
      try {
        const response = await fetchGetData(`api_searchsymbol?query=${query}`);
        setOptions(response.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setOptions([]);
      }
    } else {
      setOptions([]);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => searchData(search), 300);
    return () => clearTimeout(debounceTimer);
  }, [search, searchData]);

  const handleSelect = (option) => {
    if (value.length < limit) {
      const newValue = value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange({ target: { name, value: newValue } });
    } else {
      console.log("you can add only 10 values");
      alert(
        "you can't add more watchlists please connect to admin on whatsapp +916304109306"
      );
    }
  };

  const handleRemove = (optionValue) => {
    const newValue = value.filter((v) => v !== optionValue);
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="relative lg:flex min-sm:flex-col gap-2">
      <div className="w-2/3">
        <input
          onClick={() => setIsOpen(!isOpen)}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full font-bold p-2 border border-gray-300 rounded-md mb-2"
          placeholder="Search WatchList..."
        />
      </div>

      {(isOpen || options.length > 0) && (
        <div className="z-10 w-full mt-1 bg-white border border-gray-300 rounded-md max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  value.includes(option) ? "bg-blue-100" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">
              {search.length >= 3
                ? "No options found"
                : "Type at least 3 characters to search"}
            </div>
          )}
        </div>
      )}

      <div
        className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span
                key={v}
                className="bg-blue-100 px-2 py-1 rounded-md text-sm flex items-center"
              >
                {v}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(v);
                  }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 font-bold">WatchList...</span>
        )}
      </div>
    </div>
  );
};





const DynamicForm = ({ formData = {}, onClose }) => {
  const [formValues, setFormValues] = useState({});
  const [options, setOptions] = useState([]);
  const url = formData?.action_url?.replace("/", "");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (formData?.page && Array.isArray(formData.page)) {
      const initialValues = { ...formData.info };
      const optionsData = [];

      // Process all fields including hidden ones first
      formData.page.forEach(field => {
        if (field.tag === 'input' && field.type === 'hidden') {
          initialValues[field.name] = formData.info?.[field.name] ?? field.value ?? '';
        }
      });

      // Process visible fields (exclude children and hidden fields)
      const visibleFields = formData.page.filter(field =>
        !field.children && !(field.tag === 'input' && field.type === 'hidden')
      );

      visibleFields.forEach(field => {
        const fieldName = field.name;
        const mappedFieldName = fieldName === 'tp_1' ? 'tp1' : fieldName === 'tp_2' ? 'tp2' : fieldName;
        const fieldValue = formData.info?.[mappedFieldName] ?? field.value ?? '';

        if (field.tag === 'select') {
          if (fieldName.endsWith('[]')) {
            initialValues[fieldName] = Array.isArray(fieldValue)
              ? fieldValue
              : fieldValue ? [fieldValue] : [];
          } else {
            initialValues[fieldName] = fieldValue || (field.options?.[0]?.value ?? '');
          }
        } else {
          initialValues[fieldName] = fieldValue;
        }
      });

      // Process legs for options grid
      if (Array.isArray(initialValues.legs)) {
        initialValues.legs.forEach(leg => {
          const optionRow = {};
          Object.keys(leg).forEach(key => {
            optionRow[`o${key}`] = leg[key];
          });
          optionsData.push(optionRow);
        });
        setOptions(optionsData);
        delete initialValues.legs; // Remove legs from main form values
      }

      setFormValues(initialValues);
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name.endsWith('[]')
        ? (Array.isArray(value) ? value : [value])
        : (type === 'checkbox' ? (checked ? 1 : 0) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Array.isArray(formValues['symbol[]']) && formValues['symbol[]'].length === 0) {
      alert("Please select at least one symbol");
      return;
    }

    const formData = new FormData();
    Object.keys(formValues).forEach(key => {
        formData.append(key, formValues[key])
    });

    formData.append("token", token);

    options.forEach(option => {
      Object.keys(option).forEach(key => {
        formData.append(key, option[key]);  // No slicing, keep "o" prefix
      });
    });

    try {
      await postFormData(url, formData);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  const renderFormField = (field) => {
    if (field.tag === 'input' && field.type === 'hidden') {
      return (
        <input
          type="hidden"
          name={field.name}
          value={formValues[field.name] || field.value || ''}
        />
      );
    }

    const isReadOnly = Array.isArray(formData.readonly) && formData.readonly.includes(field.name);
    const currentValue = formValues[field.name] ?? field.value ?? '';
    const commonProps = {
      name: field.name,
      value: currentValue,
      onChange: handleInputChange,
      required: field.required === 'True',
      disabled: isReadOnly,
      className: `w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isReadOnly ? 'bg-gray-100 text-red-500 font-semibold cursor-not-allowed' : ''
      }`
    };

    switch (field.tag) {
      case 'input':
        return (
          <input
            type={field.type || 'text'}
            min={field.min}
            max={field.max}
            placeholder={field.label}
            {...commonProps}
          />
        );
      case 'select':
        if (field.name.endsWith('[]')) {
          return (
            <MultiSelect
              name={field.name}
              options={field.options}
              value={formValues[field.name] || []}
              onChange={handleInputChange}
              disabled={isReadOnly}
              limit={formData.StrategyRemaining}
            />
          );
        }
        return (
          <select {...commonProps}value={
            currentValue ||
            (field.options?.length ? field.options[0].value : '')
          }>
            <option value="">Select an option</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.text}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (!formData?.page?.length) {
    return <div className="text-center text-red-500">No form data available</div>;
  }

  // Filter fields once during render
  const visibleFields = formData.page.filter(field =>
    !field.children && !(field.tag === 'input' && field.type === 'hidden')

  );



  const hiddenFields = formData.page.filter(field =>
    field.tag === 'input' && field.type === 'hidden'
  );

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <button
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2 mb-6 border border-black bg-white text-black rounded hover:bg-red-800 hover:text-white transition"
      >
        <img src="back.svg" alt="Back" className="w-5 h-5" />
        Go Back
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Order</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleFields.map((field, i) => (
            <div
              key={i}
              className={`mb-4 ${field.name?.endsWith('[]') || field.name === 'botname' ? 'md:col-span-2 lg:col-span-4' : ''}`}
            >
              <label htmlFor={field.name} className="uppercase text-sm font-medium text-gray-700 mb-1 block">
                {capitalize(field.label)}
              </label>
              {renderFormField(field)}
            </div>
          ))}
        </div>

        {formData.page.some(field => field.children) && (
            <OptionGrid
              formData={formData}
              options={options}
              setOptions={setOptions}
              formValues={formValues}
              setFormValues={setFormValues}
            />
          )}


        {hiddenFields.map((field, i) => (
          <React.Fragment key={i}>{renderFormField(field)}</React.Fragment>
        ))}

        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;


