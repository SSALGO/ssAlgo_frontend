import React, { useMemo } from "react";

export const tableFields = ['ooption', 'ostrike', 'oside', 'oexpiry', 'olot'];

export const initialOption = {
    'ooption': 'CE',
    'ostrike': 0,
    'oside': 'BUY',
    'oexpiry': 'Current Week',
    'olot': 1
};

const OptionGrid = ({
    options,
    setOptions,
    formData
}) => {
    // console.log("options", options)
    const formatTableFields = useMemo(() => {
        const parent = formData.page.find(f => Array.isArray(f.children));
        return parent?.children || [];
    }, [formData.page]);

    console.log("formatTableFields", formatTableFields)


    const handleTableInputChange = (e, index) => {
        setOptions([
            ...options.slice(0, index),
            {
                ...options[index],
                [e.target.name]: e.target.value
            },
            ...options.slice(index + 1),
        ]);
    }

    const deleteRow = (index) => {
        const data = [...options];
        data.splice(index, 1);

        setOptions([
            ...data
        ]);
    }

    const addRow = () => {
        setOptions([
            ...options,
            {
                ...initialOption
            }
        ]);
    }

    const renderTableFields = (
        field,
        option,
        index
    ) => {
        const fieldName = field.name;
        const commonProps = {
            name: fieldName,
            value: option[fieldName] !== undefined ? option[fieldName] : '',
            onChange: (e) => handleTableInputChange(e, index),
            required: field.required === 'True',
            className: `w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-bold`,
        };

        switch (field.tag) {
            case 'input':
                return (
                    <input
                        {...commonProps}
                        type={field.type || 'text'}
                        min={field.min}
                        max={field.max}
                        placeholder={fieldName}

                    />
                );
            case 'select':
                return (
                    <select {...commonProps}>
                        {field.options && field.options.map((option, index) => (
                            <option key={index} value={option.value}>

                                {option.text}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    }

    return (
        <div className='mt-4'>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-white uppercase bg-[#450303]">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Option
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Strike
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Side
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Expiry
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Lots
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {options.map((option, i) => (
                            <tr
                                key={'table_' + i}
                                className="bg-[#ff5733] border-b dark:border-gray-700 border-gray-200"
                            >
                                {formatTableFields.map((field) => field.name && (
                                    <td
                                        className="px-6 py-4"
                                        key={field.name}
                                    >
                                        {renderTableFields(field, option, i)}
                                    </td>
                                ))}
                                <td>
                                    <button
                                        onClick={() => deleteRow(i)}
                                        type="button"
                                        className="text-white bg-[#450303] hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={addRow}
                type="button"
                className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Add Row
            </button>
        </div>
    );
}

export default OptionGrid;
