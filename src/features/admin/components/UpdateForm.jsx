

// UpdateForm.js
import React, { useState } from "react";

const UpdateForm = ({ initialData, fields, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData);
//  console.log("update form ",initialData)
//  console.log("update form ",fields)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <div className='flex flex-col-reverse lg:flex-row justify-between  overflow-hidden'>

     
    <form onSubmit={handleSubmit} className="  lg:w-[500px] ">
      <h2 className="text-2xl font-bold mb-4 text-[#0A1438]">Update {fields.title}</h2>
      {fields.inputs.map((input) => (
      
        
        <div key={input.name} className="mb-4">
         <div className="flex gap-2 mb-2">
         <img src={input.icon} alt="img" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
          {input.label}
          </p>
        </div>
          {/* <img src={input.icon} alt="ajay" /> */}
          {/* <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={input.name}>
           
          </label> */}
          
          <input
            type={input.type}
            name={input.name}
            value={formData[input.name]}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full h-[50px] py-2 px-3 text-gray-700 "
          />
        </div>
      ))}
      <div className="">
        {/* <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
        >
          Cancel
        </button> */}
        <button
          type="submit"
          className="bg-[#FF5733] mt-5 w-full hover:bg-red-700 text-white font-bold py-2 px-4 rounded  h-[50px]"
        >
          Update {fields.title}
        </button>
      </div>
      </form>
      {
        fields.inputs.map((input) => (
        <img key={`${input.name}-preview`} src={input.img} alt="" />
      ))
        }
         </div>
      </>
  );
};

export default UpdateForm;
