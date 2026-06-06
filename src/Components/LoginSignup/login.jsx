



import React, { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postData } from '../../api';
import { useNavigate } from "react-router-dom"; // Corrected import for useNavigate

const Login = ({ onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate(); // Corrected to useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postData("api_login", formData);
      // console.log("")
      if (response.error) {
        throw new Error(response.error); // Handle API errors explicitly
      }
      const token = response.token; // Adjust based on the actual response structure
      toast.success("Login successful!");
      // console.log(token)
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("userType", "user");
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
      // console.error("Login failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 ">
      <ToastContainer />
      <div className="flex justify-center">
      <h5 className="align-center text-3xl font-extrabold mb-2 text-[#FF5733] max-md:text-lg lg:mt-10">
        WELCOME TO SSALGO
      </h5></div>
      <div className="uppercase text-sm mb-3 flex flex-col  align-center font-medium max-md:text-xs">
      <span className="self-center">Contact: WhatsApp - 6304109306 (Messages),</span>
        <span className="self-center">Mon-Fri, 
        9am-5pm, </span>
      <span className="self-center">Closed on festivals and market holidays</span>
      
      </div>
      <div className="mb-4">
        <div className="flex gap-2 mb-2 max-sm:hidden">
          <img src="user.svg" alt="" />
          <p className="block text-sm font-medium mb-1 text-[#252F4A] ">Email/Username</p>
        </div>
        <div className="relative">
          <input
            className="w-full px-3 h-[50px] lg:w-[500px] py-2 pr-10 border border-gray-300 rounded-md  "
            type="text" 
            name="username"
            id="username"
            placeholder="Enter Email/Username"
            onChange={handleChange}
            disabled={loading}
            required
          />
         
        </div>
      </div>
      <div className="mb-3">
        <div className="flex gap-2 mb-2 pl-1 items-center max-sm:hidden">
          <img src="pass.svg" alt="" />
          <p className="block text-sm font-medium mb-2 text-[#252F4A]">Password</p>
        </div>
        <div className="relative">
          <input
            className="w-full px-3 py-2 pr-10 h-[50px] lg:w-[500px] border border-gray-300 rounded-md focus:ring-2 "
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="Enter Password"
            onChange={handleChange}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-2 transform -translate-y-1/2"
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
      <div className="flex justify-between text-right mb-3">
        <a onClick={onSwitchToForgotPassword} href="#" className="text-sm text-[#252F4A] hover:underline">
          Forgot Password?
        </a>
        <div className="text-center  flex justify-center gap-1 ">
        <p className="text-sm font-medium text-[#79829e]">Don't have an account?</p>
        <p
          className="text-[#252F4A] text-sm font-bold cursor-pointer"
          onClick={onSwitchToSignup}
        >
          Register
        </p>
      </div>
      </div>
      <button
        type="submit"
        className="w-full mt-5 mb-8 py-2 h-[50px] lg:w-[500px] bg-[#FF5733] text-white font-semibold rounded-md hover:bg-orange-700 text-sm"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      
    </form>
  );
};

export default Login;
