import React, { useState, useEffect, useCallback } from "react";
import { displayValue } from '../../utils/displayValue';
import { fetchGetData, postFormData } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OptionGrid, { initialOption } from '../OptionGrid/OptionGrid';
import { InlineError, RiskSummaryCard, StatusBadge } from "../../shared/components/TradingUi";


const MultiSelect = ({ limit, value = [], onChange, name }) => {
  const [search, setSearch] = useState("");
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
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange({ target: { name, value: newValue } });
    } else {
      toast.error("Watchlist limit reached. Contact admin to increase your strategy limit.");
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
                {displayValue(option)}
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
                {displayValue(v)}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
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
        delete initialValues.legs; // Remove legs from main form values
      }

      const hasOptionGrid = formData.page.some(field => Array.isArray(field.children));
      setOptions(optionsData.length > 0 ? optionsData : (hasOptionGrid ? [{ ...initialOption }] : []));
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
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const getHelperText = (field) => {
    const name = String(field.name || "").toLowerCase();
    if (name.includes("timeframe")) return "Choose the candle interval used by the strategy signal.";
    if (name.includes("lot") || name.includes("qty") || name.includes("quantity")) return "Controls order size. Keep this small while validating a setup.";
    if (name.includes("sl")) return "Stop loss should reflect the maximum loss you are willing to accept.";
    if (name.includes("tp") || name.includes("target")) return "Target profit level used for exits when supported by the strategy.";
    if (name.includes("live")) return "Paper mode is simulated. Live mode may place broker orders.";
    if (field.name?.endsWith("[]")) return "Search at least 3 characters, then select one or more tradable symbols.";
    return "";
  };

  const validateForm = () => {
    const nextErrors = {};
    const fields = formData.page?.filter(field =>
      !field.children && !(field.tag === 'input' && field.type === 'hidden')
    ) || [];

    fields.forEach((field) => {
      const required = field.required === "True" || field.required === true;
      const value = formValues[field.name];
      if (required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
        nextErrors[field.name] = `${displayValue(field.label || field.name)} is required.`;
      }
    });

    if (Array.isArray(formValues['symbol[]']) && formValues['symbol[]'].length === 0) {
      nextErrors['symbol[]'] = "Select at least one symbol.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }

    const submission = new FormData();
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (Array.isArray(value)) {
        value.forEach((item) => submission.append(key, item));
      } else {
        submission.append(key, value);
      }
    });

    submission.append("token", token);

    options.forEach(option => {
      Object.keys(option).forEach(key => {
        submission.append(key, option[key]);
      });
    });

    setIsSubmitting(true);
    try {
      const response = await postFormData(url, submission);
      if (response?.success === false) {
        throw new Error(response.message || "Strategy creation failed.");
      }
      toast.success(response?.message || "Strategy created successfully.");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError(error.message || "Unable to create the strategy.");
      toast.error(error.message || "Unable to create the strategy.");
    } finally {
      setIsSubmitting(false);
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
              <option key={idx} value={opt.value}>{displayValue(opt.text)}</option>
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

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create Strategy</h2>
        <StatusBadge value={formValues.live ? "Live" : "Paper"} tone={formValues.live ? "live" : "paper"} />
      </div>

      <div className="mb-6">
        <RiskSummaryCard strategy={formValues} compact />
      </div>

      {formError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold normal-case text-red-700">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleFields.map((field, i) => (
            <div
              key={i}
              className={`mb-4 ${field.name?.endsWith('[]') || field.name === 'botname' ? 'md:col-span-2 lg:col-span-4' : ''}`}
            >
              <label htmlFor={field.name} className="uppercase text-sm font-medium text-gray-700 mb-1 block">
                {displayValue(capitalize(field.label))}
              </label>
              {renderFormField(field)}
              {getHelperText(field) ? <p className="mt-1 text-xs normal-case text-[#4B5675]">{getHelperText(field)}</p> : null}
              <InlineError message={errors[field.name]} />
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
          disabled={isSubmitting}
          className="mt-6 w-full rounded-md bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Save Strategy"}
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;


