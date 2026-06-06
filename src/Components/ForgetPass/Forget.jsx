

import React, { useState } from 'react';
import { postData } from "../../api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Forgot = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const response =  await postData("api_forgot_otp_reset_password",{email})
    if(response.success===true) {
      toast.success(response.message);
    onSubmit(email); // Call the parent component's function to move to the next step
      
    }
    else{
      console.error(response.message)
      toast.error(response.message);
    }


  };

  return (
    <div className="    ">
      <toastContainer />
      <h2 className="text-2xl font-bold mb-4 text-[#0A1438] max-lg:text-lg w-full">Forgot Your Password 🙄</h2>
      <p className="mb-4 text-[#252F4A] text-sm font-medium">Enter your email address you're using for your account below.</p>
      <form onSubmit={handleSubmit} className='lg:w-[500px] w-full'>
        <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <img src="email.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
            {" "}
            Email Address
          </p>
        </div>
          {/* <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label> */}
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className=" px-3 py-2 border h-[50px] w-full   border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter Email Address" 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="mt-3 bg-[#FF5733] w-full  h-[50px] text-white py-2 px-4 rounded-md text-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Send OTP
        </button>
      </form>
    
    </div>
  );
};

export default Forgot;
