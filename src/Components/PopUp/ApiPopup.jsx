import React, { useState } from 'react';
import { postData } from '../../api';

const ApiPopup = ({ onCancel }) => {
  // States for form inputs
  const [apikey, setApiKey] = useState('');
  const [apisecret, setApiSecret] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    // Form data to send
    const formData = {
      apikey,
        apisecret,
      token
    };
      // console.log(formData)
    
    try {
      // Send the form data to the backend
     const response = await postData('api_add_apikey', formData);

      // Handle success
        // console.log('API response:', response.data);
        onCancel();
      // You can add logic to close the popup or handle success message here

    } catch (error) {
      // Handle error
        console.error('Error submitting form:', error);
        onCancel();
    }
  };
    
  

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
        <h1 className="text-2xl font-bold text-[#FF5733]"> Add Api Key</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Input field for API Key */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apikey">
              API ID
            </label>
            <input
              type="text"
              id="apikey"
              value={apikey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />
          </div>

          {/* Input field for API Secret */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apisecret">
              API Secret
            </label>
            <input
              type="text"
              id="apisecret"
              value={apisecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your API Secret"
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-11">
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF5733] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add API
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiPopup;
