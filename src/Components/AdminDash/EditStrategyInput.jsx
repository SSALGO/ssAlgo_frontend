



import React, { useState, useEffect } from 'react';
import { postData } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const EditStrategyInput = ({ editdata, closeEdit }) => {
  // State for form inputs
  const [formValues, setFormValues] = useState({
    token: '',
    strategy: '',
    timeframe: '',
    r1: 0,
    k1: 0,
    r2: 0,
    k2: 0,
  });

  // Initialize form values with editdata when the component mounts
  useEffect(() => {
    if (editdata) {
      setFormValues({
        token: localStorage.getItem('token'),
        strategy: editdata.strategy,
        timeframe: editdata.timeframe || '30m',
        r1: editdata.r1 || 0,
        k1: editdata.k1 || 0,
        r2: editdata.r2 || 0,
        k2: editdata.k2 || 0,
      });
    }
  }, [editdata]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postData('api_edit_strategyinput', formValues);
      // console.log('API Response:', response);
      if (response.success) {
        toast.success('Data saved successfully');
      } else {
        toast.error('Error saving data');
      }
      window.location.reload();
    } catch (error) {
      console.error('API Error:', error);
    }
    closeEdit(); // Close the edit modal after saving
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <ToastContainer />
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl"
      >
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Edit Strategy Input
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Strategy
            </label>
            <input
              type="text"
              name="strategy"
              value={formValues.strategy}
              readOnly
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              TimeFrame
            </label>
            <select
              name="timeframe"
              value={formValues.timeframe}
              onChange={handleInputChange}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5m">5m</option>
              <option value="30m">30m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-6">
          {/* R1 */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              R1
            </label>
            <input
              type="number"
              name="r1"
              value={formValues.r1}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* K1 */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              K1
            </label>
            <input
              type="number"
              name="k1"
              value={formValues.k1}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* R2 */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              R2
            </label>
            <input
              type="number"
              name="r2"
              value={formValues.r2}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* K2 */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              K2
            </label>
            <input
              type="number"
              name="k2"
              value={formValues.k2}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStrategyInput;
