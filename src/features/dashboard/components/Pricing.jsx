








import React, { useEffect, useState, useCallback } from 'react';
import { postData } from '../../../api';
import { toast } from 'react-toastify';
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../../../components/common/TradingUi';
import { displayValue, getApiData } from '../../../utils/displayValue';

// Utility function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the payment service.'));
    document.body.appendChild(script);
  });
};

// PricingCard component
const PricingCard = ({ title, originalPrice, discountedPrice, price, color, priceColor, onPaymentClick, disabled }) => (
  <div className=" uppercase bg-white p-4 rounded-lg shadow-md border-2 flex flex-col">
    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <div className="w-9 h-9 rounded-full bg-white"></div>
    </div>

    <h3 className="text-xl font-bold lg:mb-2 max-lg:text-lg mt-2 text-[#1E2129]">{title}</h3>
    {/* <p className="text-[#99A1B7] text-lg lg:mb-4 max-lg:text-sm">{description}</p> */}
    <hr className="border-t border-dotted border-gray-300 my-2" />
    <div className="flex gap-1">
      <p className={`text-2xl font-bold max-lg:text-xl ${priceColor}`}>₹{discountedPrice}</p>
      <span className="text-lg font-normal mt-1 max-lg:text-sm text-gray-600 line-through">({originalPrice})</span>
    </div>
    <hr className="border-t border-dotted border-gray-300 my-2" />

    {/* <ul className="mt-3 flex-grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center mb-1 text-[#79829E]">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {feature}
        </li>
      ))}
    </ul> */}
    <button 
      onClick={() => onPaymentClick(title, price)}  
      disabled={disabled}
      className="bg-[#FF5733] uppercase w-full mt-5 max-lg:mt-3 text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? "Processing..." : "Pay Now"}
    </button>
  </div>
);

// Main Pricing component
const Pricing = () => {
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState("");
  const [currentPlan, setCurrentPlan] = useState({});

  // Fetch pricing data
  const fetchPricing = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postData("api_pricing");
      setPricing(Array.isArray(response?.data) ? response.data : []);
      const token = localStorage.getItem("token");
      if (token) {
        const profileResponse = await postData("api_user_profile", { token });
        setCurrentPlan(getApiData(profileResponse) || {});
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
      setError("Unable to fetch pricing information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Handle payment initiation
  const handlePayment = useCallback(async (title, price) => {
    try {
      setError(null);
      setPayingPlan(title);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await postData("api_pay", { price:title, token });
      const paymentData = response?.data;
      if (!paymentData?.payment?.id || !paymentData?.key || !paymentData?.duration) {
        throw new Error("The payment service returned an incomplete response.");
      }

      await loadRazorpayScript();

      const options = {
        key: paymentData.key,
        amount: paymentData.payment.amount,
        currency: "INR",
        order_id: paymentData.payment.id,
        name: "SSALGO",
        description: "Subscription Payment",
        handler: async (paymentResponse) => {
          try {
            await postData("api_pay_verify", {
              signature: paymentResponse.razorpay_signature,
              payment_id: paymentResponse.razorpay_payment_id,
              order_id: paymentResponse.razorpay_order_id,
              token,
              duration: paymentData.duration,
            });
            toast.success("Payment verified and subscription updated.");
            fetchPricing();
          } catch (verificationError) {
            console.error("Payment verification error:", verificationError);
            toast.error(verificationError.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: paymentData.name,
          email: paymentData.email,
          contact: paymentData.ph_nm,
        },
        theme: {
          color: "#FF5733",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "An error occurred while processing the payment. Please try again.");
    } finally {
      setPayingPlan("");
    }
  }, [fetchPricing]);

  // Load Razorpay script and fetch pricing on component mount
  useEffect(() => {
    loadRazorpayScript().then(fetchPricing);
  }, [fetchPricing]);

  // Error state
  if (error) {
    return (
      <div className="p-4"><ErrorState message={error} onRetry={fetchPricing} /></div>
    );
  }

  // Loading state
  if (isLoading) {
    return <div className="p-4"><LoadingState label="Loading pricing..." /></div>;
  }


  const colors = [
    { priceColor: "text-purple-500", bgColor: "bg-purple-500" },
    { priceColor: "text-green-500", bgColor: "bg-green-500" },
    { priceColor: "text-blue-500", bgColor: "bg-blue-500" },
    { priceColor: "text-red-500", bgColor: "bg-red-500" },
    { priceColor: "text-orange-500", bgColor: "bg-orange-500" }
  ];
  
  const plans = (pricing || []).map((item, index) => ({
    title: item[0],                   // Plan title (e.g., "1 Month")
    originalPrice: item[1],           // Original price
    discountedPrice: item[2],         // Discounted price
    priceColor: colors[index % colors.length].priceColor, // Get price color from colors array
    color: colors[index % colors.length].bgColor    // Get background color from colors array
  }));
  

  // 
  // Render pricing plans
  return (
    <div className=" uppercase mx-auto px-3 lg:px-6 py-4">
      <h1 className="text-3xl font-bold mb-4 text-[#0A1438] max-lg:text-2xl max-lg:mt-14">Pricing</h1>
      <p className="text-[#4B5675] text-lg mb-8 max-lg:mb-4 max-lg:text-sm">
        Pricing available for Monthly, Quarterly, Half Yearly, and Yearly subscriptions
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-[#79829E]">Current plan</p>
          <p className="mt-2 text-xl font-bold normal-case text-[#0A1438]">{displayValue(currentPlan.subtype) || "Not available"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-[#79829E]">Plan expiry</p>
          <p className="mt-2 text-xl font-bold normal-case text-[#0A1438]">{displayValue(currentPlan.end) || "Not available"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-[#79829E]">Payment history</p>
          <div className="mt-2"><StatusBadge value="API not ready" tone="warning" /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {plans.length ? plans.map((plan, index) => (
          <PricingCard key={index} {...plan} onPaymentClick={handlePayment} disabled={Boolean(payingPlan)} />
        )) : <div className="lg:col-span-5"><EmptyState title="No pricing plans available" description="The pricing API did not return plan data." /></div>}
      </div>
    </div>
  );
};

export default Pricing;
