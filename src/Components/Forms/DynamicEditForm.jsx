
import React, { useState, useEffect, useCallback } from 'react';
import { displayValue } from '../../utils/displayValue';
import { postData, fetchGetData, postFormData } from '../../api';
import OptionGrid, { tableFields } from '../OptionGrid/OptionGrid';


const MultiSelect = ({ limit, value = [], onChange, name, disabled }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);

  const searchData = useCallback(async (query) => {
    if (query.length >= 3) {
      try {
        const response = await fetchGetData(`api_searchsymbol?query=${query}`);
        setOptions(response.data?.results || response.results || []);
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
        ? value.filter(v => v !== option)
        : [...value, option];
      onChange({ target: { name, value: newValue } });
    } else {
      console.log("you can add only 10 values");
      alert("you can't add more watchlists please connect to admin on whatsapp +916304109306");
      // toast.error("you can add only 10 values")
    }
  };

  const handleRemove = (optionValue) => {
    const newValue = value.filter(v => v !== optionValue);
    onChange({ target: { name, value: newValue } });
  };

  return (

    <div className=" relative lg:flex min-sm:flex-col  gap-2 ">

      <div className='w-2/3'>
        {/* <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {name}
      </label> */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full font-bold p-2 border border-gray-300 rounded-md mb-2 ${disabled ? 'bg-gray-100 cursor-not-allowed ' : ''
            }`}
          placeholder="Search WatchList..."
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}


        />
      </div>

      {(isOpen && options.length > 0) && (
        <div className=" z-10 w-full mt-1 bg-white border border-gray-300 rounded-md max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${value.includes(option) ? 'bg-blue-100' : ''
                  }`}
                onClick={() => handleSelect(option)}
              >
                {displayValue(option)}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400">
              {search.length >= 3 ? 'No options found' : 'Type at least 3 characters to search'}
            </div>
          )}
        </div>
      )}
      <div
        className={`w-full p-2 border border-gray-300 rounded-md ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
          }`}

      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map(v => (
              <span key={v} className="bg-blue-100 px-1 py-0 rounded-md text-sm flex items-center">
                {displayValue(v)}
                {!disabled && (
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
                )}
              </span>
            ))}
          </div>
        ) : (
          <span className="font-bold text-gray-400">WatchList...</span>
        )}
      </div>
    </div>
  );
};




const DynamicEditForm = ({ formData = {}, onClose }) => {
  const [formValues, setFormValues] = useState({});
  const [options, setOptions] = useState([]);
  const url = formData.action_url?.replace("/", "");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (formData?.page) {
      const initialValues = { ...formData.info };

      formData.page.forEach(field => {
        const fieldName = field.name;
        const infoKey = fieldName === 'tp_1' ? 'tp1' : fieldName === 'tp_2' ? 'tp2' : fieldName;
        const fieldValue = formData.info[infoKey];

        if (!tableFields.includes(fieldName)) {
          if (field.tag === 'select') {
            initialValues[fieldName] = fieldName.endsWith('[]')
              ? Array.isArray(fieldValue) ? fieldValue : fieldValue ? [fieldValue] : []
              : fieldValue ?? '';
          } else if (typeof fieldValue === 'boolean') {
            initialValues[fieldName] = fieldValue;
          } else {
            initialValues[fieldName] = fieldValue ?? '';
          }
        }
      });

      // Handle legs/options transformation
      const optionsData = (initialValues.legs || []).map(ele => {
        const record = {};
        Object.keys(ele).forEach(key => {
          record[`o${key}`] = ele[key];
        });
        return record;
      });

      setOptions(optionsData);
      delete initialValues.legs;
      setFormValues(initialValues);
    }
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Array.isArray(formValues['symbol[]']) && formValues['symbol[]'].length === 0) {
      alert("Please select at least one watchlist.");
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

    const payload = {
      formData
    };

    try {
      await postFormData(url, formData);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.endsWith('[]')) {
      setFormValues(prev => ({
        ...prev,
        [name]: Array.isArray(value) ? value : [value]
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
      }));
    }
  };

  const renderFormField = (field) => {
    const fieldName = field.name;
    if (!formData || !Array.isArray(formData.readonly)) {
      formData.readonly = [];
    }

    const isReadOnly = formData.readonly.includes(fieldName);
    const commonProps = {
      name: fieldName,
      value: formValues[fieldName] ?? '',
      onChange: handleInputChange,
      required: field.required === 'True',
      className: `w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isReadOnly ? 'text-red-500 bg-gray-100 cursor-not-allowed font-bold' : ''}`,
      disabled: isReadOnly
    };

    switch (field.tag) {
      case 'input':
        if (field.type === 'hidden') return <input type="hidden" {...commonProps} />;
        return <input {...commonProps} type={field.type || 'text'} min={field.min} max={field.max} placeholder={fieldName} />;
      case 'select':
        if (fieldName.endsWith('[]')) {
          return (
            <MultiSelect
              options={field.options}
              value={Array.isArray(formValues[fieldName]) ? formValues[fieldName] : []}
              onChange={handleInputChange}
              name={fieldName}
              disabled={isReadOnly}
              limit={formData.StrategyRemaining}
            />
          );
        }
        return (
          <select {...commonProps}>
            {field.options?.map((option, i) => (
              <option key={i} value={option.value}>{option.text}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (!formData?.page) {
    return <div className="text-center text-red-500">No form data available</div>;
  }

  const visibleFields = formData.page.filter(field => (field.tag !== 'input' || field.type !== 'hidden') && !tableFields.includes(field.name));
  const hiddenFields = formData.page.filter(field => field.tag === 'input' && field.type === 'hidden' && !tableFields.includes(field.name));

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <button
        onClick={onClose}
        className="flex items-center justify-center gap-2 px-4 py-2 my-6 border border-black bg-white text-black rounded hover:bg-[rgb(69,3,3)] hover:text-white transition-all"
      >
        <img src="back.svg" alt="Go back" className="w-5 h-5" />
        <span className="text-center font-medium">Go Back</span>
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleFields.map((field, index) => (
            <div
              key={index}
              className={`mb-4 ${field?.name?.endsWith('[]') || field.name === 'botname' ? 'md:col-span-2 lg:col-span-4' : ''}`}
            >
              <label htmlFor={field.name} className="uppercase block text-sm font-medium text-gray-700 mb-1">
                {capitalize(field.label)}
              </label>
              <div className={field?.name?.endsWith('[]') ? 'mt-1' : ''}>
                {renderFormField(field)}
              </div>
            </div>
          ))}
        </div>

        {formData.page.some(field => field.children) && (  <OptionGrid formData={formData} options={options} setOptions={setOptions} />)}

        {hiddenFields.map((field, index) => renderFormField(field))}
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default DynamicEditForm;

