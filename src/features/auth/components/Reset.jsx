import React, { useState } from "react";
import { postData } from "../../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Reset = ({ email,otp }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();

    const response= postData("api_otp_reset_password",{otp,email,new_password:newPassword,confirm_password:confirmPassword});
   if(response.success) {

    toast.success(response.message)
    window.location.reload();
   }
   else{
    toast.error(response.message)
   }
    
    
  };

  return (
    <div className="  w-full   ">
      <ToastContainer/>
      <h2 className="text-2xl font-bold text-[#0A1438] max-lg:text-lg">Reset Password 🔒</h2>
      <p className=" text-[#252F4A] text-sm font-medium mt-1 ">
        Reset your password and login with your new secure password.
      </p>
      <form onSubmit={handleSubmit} className="lg:w-[500px]">
        <div className="mb-4">
          <div className="flex gap-2 mt-4  mb-2 pl-1 items-center">
            <img src="pass.svg" alt="" className="" />
            <p className="block text-sm font-medium  text-[#252F4A]">
              New Password*
            </p>
          </div>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border  h-[50px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter New Password"
            required
          />
        </div>
        <div className="mb-4">
          <div className="flex gap-2 mt-4  mb-2 pl-1 items-center">
            <img src="pass.svg" alt="" className="" />
            <p className="block text-sm font-medium  text-[#252F4A]">
              Confirm New Password*
            </p>
          </div>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border h-[50px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Confirm New Password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full mt-14 h-[50px] bg-[#FF5733] text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Reset Password
        </button>
      </form>
      {/* <div className="mt-4 text-xs text-center text-gray-500">
        © 2024 SALGO. All rights reserved.
      </div> */}
    </div>
  );
};

export default Reset;
