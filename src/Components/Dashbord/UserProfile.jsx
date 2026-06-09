import React, { useEffect, useState } from 'react';
import { postData } from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { displayValue, getApiData, toBooleanFlag } from '../../utils/displayValue';

const UserProfile = ({ user }) => {
  const tokens = localStorage.getItem("token");

  const [userProfile, setUserProfile] = useState(user || {});

  // Editable fields (token not displayed)
  const [token, setToken] = useState(tokens);
  const [dayProfitLimit, setDayProfitLimit] = useState('');
  const [dayLossLimit, setDayLossLimit] = useState('');
  const [tradeLimit, setTradeLimit] = useState('');

  useEffect(() => {
    setUserProfile(user || {});
    if (user?.token) {
      setToken(user.token);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens) return;
      const response = await postData("api_user_profile", { token: tokens });
      const profile = getApiData(response);
      if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
        setUserProfile(profile);
        setToken(profile.token || tokens);
        setDayProfitLimit(profile.day_profit_limit || '');
        setDayLossLimit(profile.day_loss_limit || '');
        setTradeLimit(profile.trade_limit || '');
      }
    };
    fetchProfile();
  }, [tokens]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await postData("api_user_profile", {
      token,
      day_profit_limit: dayProfitLimit,
      day_loss_limit: dayLossLimit,
      trade_limit: tradeLimit,
    });

    if (response.success) {
      toast.success("Trading limits updated!");
      setUserProfile(response.data);
    } else {
      toast.error("Update failed. Try again.");
    }
  };

  return (
    <div className="uppercase lg:px-6 px-3 py-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 max-lg:mt-14">User Profile</h1>
      <h2 className="text-xl font-semibold mb-4">Account Overview</h2>

      <div className="bg-white border-gray-200 border-2 rounded-lg">
        <h2 className="text-xl font-semibold max-md:px-2 px-5 items-center py-3 max-md:py-2">
          Profile Details
        </h2>
        <div className="bg-gray-200 mb-6 border-b-2"></div>
        <div className="space-y-4 px-5 max-md:px-1">
          <div className="flex items-center">
            <span className="w-32 font-medium text-[#79829E]">Username :</span>
            <span className="text-[#252F4A] font-semibold">{displayValue(userProfile.username)}</span>
          </div>
          <div className="flex items-center">
            <span className="w-32 font-medium text-[#79829E]">Email :</span>
            <div className="flex items-center font-semibold">
              <span className="text-[#252F4A] font-semibold mr-1">{displayValue(userProfile.email)}</span>
              {toBooleanFlag(userProfile.isVerified) ? (
                <span className="bg-green-500 text-white text-sm font-semibold px-4 py-1 rounded-md">
                  Verified
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center">
            <span className="w-32 font-medium text-[#79829E]">Mobile :</span>
            <span className="text-[#252F4A] font-semibold">{displayValue(userProfile.mobile)}</span>
          </div>
          <div className="flex items-center">
            <span className="w-32 font-medium text-[#79829E]">Subscription:</span>
            <span className="text-[#252F4A] font-semibold">{displayValue(userProfile.subtype)}</span>
          </div>
          <div className="flex items-center pb-6">
            <span className="w-32 font-medium text-[#79829E]">Expiry Date :</span>
            <span className="text-[#252F4A] font-semibold">{displayValue(userProfile.end)}</span>
          </div>
        </div>
      </div>

      {/* New Section: Trading Limits */}
      <div className="bg-white border-gray-200 border-2 rounded-lg mt-10">
        <h2 className="text-xl font-semibold px-5 py-3">Trading Limit Settings</h2>
        <div className="bg-gray-200 mb-6 border-b-2"></div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6 max-md:px-1">
          <div className="flex items-center">
            <span className="w-48 font-medium text-[#79829E]">Day Profit Limit:</span>
            <input
              type="number"
              value={dayProfitLimit}
              onChange={(e) => setDayProfitLimit(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Enter day profit limit"
            />
          </div>
          <div className="flex items-center">
            <span className="w-48 font-medium text-[#79829E]">Day Loss Limit:</span>
            <input
              type="number"
              value={dayLossLimit}
              onChange={(e) => setDayLossLimit(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Enter day loss limit"
            />
          </div>
          <div className="flex items-center">
            <span className="w-48 font-medium text-[#79829E]">Trade Limit:</span>
            <input
              type="number"
              value={tradeLimit}
              onChange={(e) => setTradeLimit(e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Enter trade limit"
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 text-sm w-fit"
            >
              Update Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
