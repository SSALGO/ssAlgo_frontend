import React, { useState,useEffect } from "react";
import Forgot from "../Components/ForgetPass/Forget";
import Otp from "../Components/ForgetPass/Otp";
import Reset from "../Components/ForgetPass/Reset";

const ForgetPage = () => {
  const [step, setStep] = useState(1); // 1: ForgotPassword, 2: OTPVerification, 3: ResetPassword
  const [email, setEmail] = useState(""); // Store email entered by the user
  const [otp,setOtp]=useState("")
 
  const handleEmailSubmit = (submittedEmail) => {
    setEmail(submittedEmail); // Save the email
    setStep(2); // Move to OTP Verification step
  };

  const handleOtpSubmit = (submittedOtp) => {
    setOtp(submittedOtp)
    setStep(3); // Move to Reset Password step
  };

  return (
    
    <div className="lg:flex  max-lg:px-3 overflow-hidden gap-20  ">
      {/* <img src="Authimg.png" alt="pinu" /> */}
      
      <div className=" mt-10 flex flex-col lg:items-center justify-between">
        {step === 1 && <Forgot onSubmit={handleEmailSubmit} />}
        {step === 2 && <Otp email={email} onSubmit={handleOtpSubmit} />}
        {step === 3 && <Reset email={email} />}
        <p className="text-sm  text-[#4B5675] font-medium flex text-center mt-10  justify-center   mb-5">
          © 2024 SSALGO. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgetPage;
