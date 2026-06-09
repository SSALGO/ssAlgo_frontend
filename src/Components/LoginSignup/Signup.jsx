


import React, { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postData } from '../../api';

const SignUp = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      
      try {
        // const response = await axiosiNSTANCE("API_REGISTER,FORMDATA, CONFIG")
       
        const response = await postData("api_register", formData);
        const accessToken = response.access_token || response.token;
        const username = response.username || formData.username;

        if (!accessToken || !username) {
          throw new Error("Invalid signup response from server");
        }

        localStorage.setItem("token", username);
        localStorage.setItem("accessToken", accessToken);
      setTimeout(() => {
        window.location.reload();
      }, 0);
        toast.success("Sign up successful!");
      } catch (error) {
        toast.error(`Sign up failed: ${error.message}`);
        // console.error("Sign up failed:", error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-3">
      <ToastContainer />
      <h5 className="text-2xl font-bold text-[#FF5733] max-md:text-lg">Join SSALGO 👑</h5>
      <p className="text-sm my-2 font-medium text-[#252F4A]">
        Join SSALGO trading platform for a better experience.
      </p>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <img src="user.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
            User Name
          </p>
        </div>
        <div className="relative">
          <input
            className={`w-full px-3 h-[50px] lg:w-[500px] py-2  border border-gray-300 rounded-md ${errors.username ? 'error-input' : ''}`}
            type="text"
            name="username"
            id="username"
            placeholder={errors.username || "Set Username"}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <img src="email.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
            Email Address
          </p>
        </div>
        <div className="relative">
          <input
            className={`w-full h-[50px] lg:w-[500px] px-3 py-2  border border-gray-300 rounded-md   ${errors.email ? 'error-input' : ''}`}
            type="email"
            name="email"
            id="email"
            placeholder={errors.email || "Enter Email Address"}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex gap-2 mb-2 pl-1">
          <img src="pass.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
            Password
          </p>
        </div>
        <div className="relative">
          <input
            className={`w-full h-[50px] lg:w-[500px] px-3 py-2  border border-gray-300 rounded-md   ${errors.password ? 'error-input' : ''}`}
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder={errors.password || "Enter Password"}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <img className="w-5 h-5"
               src="eye1.png" alt="" />
            ) : (
              <img className="w-5 h-5"
               src="eye1-off.png" alt="" />
            )}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <img src="call.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A]">
            Mobile Number
          </p>
        </div>
        <div className="relative">
          <input
            className={`w-full px-3 h-[50px] lg:w-[500px] py-2  border border-gray-300 rounded-md  ${errors.mobileNumber ? 'error-input' : ''}`}
            type="text"
            name="mobile"
            id="mobile"
            placeholder={errors.mobileNumber || "Enter Mobile Number"}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-2 h-[50px] lg:w-[500px] mt-3  bg-[#FF5733] text-white font-semibold text-sm rounded-md hover:bg-orange-700"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Register Account"}
      </button>

      <div className="text-center mt-5  mb-3 flex justify-center gap-1">
        <p className="text-sm font-medium text-[#79829e]">
          Already have an account?
        </p>
        <p
          className="text-[#252F4A] text-sm font-bold cursor-pointer"
          onClick={onSwitchToLogin}
        >
          Sign In
        </p>
      </div>
    </form>
  );
};

export default SignUp;
