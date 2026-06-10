import React, { useState ,useEffect} from "react";
import Login from "../Components/LoginSignup/login";
import SignUp from "../Components/LoginSignup/Signup";
import ForgetPage from "./ForgetPage";

const AuthPage = () => {
  const [currentPage, setCurrentPage] = useState("login");

    // useEffect(() => {
    //   // Scroll to a specific position when the component loads
    //   window.scroll(0, 429);
    // }, []); // login, signup, forgetPassword

  const handleSwitchToSignup = () => setCurrentPage("signup");
  const handleSwitchToLogin = () => setCurrentPage("login");
  const handleSwitchToForgotPassword = () => setCurrentPage("forgetPassword");

  return (
    <div className="min-h-screen w-full gap-10 overflow-y-auto lg:flex lg:items-stretch">
      {/* {currentPage !== "forgetPassword" && ( */}
        <div className="m-3 bg-black rounded-md lg:-ml-60 lg:w-2/3">
          <img
            className="h-56 w-full rounded-md object-cover sm:h-72 lg:h-full"
            src="authImg.png"
            alt="SSALGO trading platform"
          />
        </div>
      {/* )} */}
      <div className="flex flex-col   ">
        {currentPage === "login" && (
          <Login
            onSwitchToSignup={handleSwitchToSignup}
            onSwitchToForgotPassword={handleSwitchToForgotPassword} // Add this for forgot password link
          />
        )}
        {currentPage === "signup" && (
          <SignUp onSwitchToLogin={handleSwitchToLogin} />
        )}
        {currentPage === "forgetPassword" && (
          <ForgetPage onSwitchToLogin={handleSwitchToLogin} /> // Add ForgetPage component here
        )}

        {currentPage !== "forgetPassword" && (
          <div className="mt-auto mx-auto text-center">
              <button className="w-full mt-5 mb-8 py-2 h-[50px] lg:w-[150px] bg-[#FF5733] text-white font-semibold rounded-md hover:bg-orange-700 text-sm"><a href="https://www.ssalgo.com/">Visit Our Website</a></button>
            <div className="mt-auto flex flex-wrap items-center justify-center px-2 text-[11px] sm:text-sm gap-3">
              <a href="https://www.ssalgo.com/privacy-policy.html"><p className="text-[#252F4A] font-medium underline">
              Privacy Policy
              </p></a>

              <a href="https://www.ssalgo.com/refundpolicy.html"><p className="text-[#252F4A] font-medium underline">
              Refund & Cancellation Policy
              </p></a>
              <a href="https://www.ssalgo.com/t&c.html"><p className="text-[#252F4A] font-medium underline">
              Terms and Conditions
              </p></a>
            </div>
            <p className="text-[11px] mt-4 text-[#4B5675] font-medium mb-10">
              © 2024 SSALGO. All rights reserved. <a href="techbizzy.com">developed by TECHBIZZY</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
