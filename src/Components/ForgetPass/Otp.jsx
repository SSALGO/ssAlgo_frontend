import React, { useState } from "react";
import { postData } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Otp = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleOtpChange = (element, index) => {
    if (!/^\d*$/.test(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedOtp = otp.join("");

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await postData("api_otp_reset_password", {
      email,
      otp: formattedOtp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (response.success) {
      toast.success(response.message);
      onSuccess?.();
      setTimeout(() => {
        window.location.href = "http://localhost:5173/login";
      }, 500);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="w-full">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-2 text-[#0A1438] max-lg:text-lg">
        OTP Verification & Reset Password 🔒
      </h2>
      <p className="mb-4 text-[#252F4A] text-sm font-medium">
        Enter the OTP sent to <strong>{email}</strong> and set your new password.
      </p>

      <form onSubmit={handleSubmit} className="lg:w-[500px]">
        {/* OTP Input */}
        <div className="flex lg:gap-5 max-lg:gap-3 lg:justify-center max-lg:ml-5 mt-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength="1"
              className="w-11 h-11 lg:w-14 lg:h-14 text-center border-2 border-[#F1F1F4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5733]"
              value={digit}
              onChange={(e) => handleOtpChange(e.target, idx)}
              required
            />
          ))}
        </div>

        {/* Password Fields */}
        <div className="mb-4 mt-6">
          <label className="block text-sm font-medium text-[#252F4A] mb-2 pl-1 flex items-center gap-2">
            <img src="pass.svg" alt="icon" /> New Password*
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border h-[50px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter New Password"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#252F4A] mb-2 pl-1 flex items-center gap-2">
            <img src="pass.svg" alt="icon" /> Confirm Password*
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border h-[50px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Confirm New Password"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-[50px] mt-6 bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Otp;
