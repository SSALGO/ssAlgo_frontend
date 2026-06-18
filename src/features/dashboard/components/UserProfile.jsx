import React, { useEffect, useState } from 'react';
import { postData } from '../../../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { displayValue, getApiData, toBooleanFlag } from '../../../utils/displayValue';
import { ErrorState, LoadingState, RiskSummaryCard, StatusBadge } from '../../../components/common/TradingUi';

const UserProfile = ({ user }) => {
  const tokens = localStorage.getItem("token");

  const [userProfile, setUserProfile] = useState(user || {});

  // Editable fields (token not displayed)
  const [token, setToken] = useState(tokens);
  const [dayProfitLimit, setDayProfitLimit] = useState('');
  const [dayLossLimit, setDayLossLimit] = useState('');
  const [tradeLimit, setTradeLimit] = useState('');
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUserProfile(user || {});
    if (user?.token) {
      setToken(user.token);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens) return;
      setLoading(true);
      setError('');
      try {
        const response = await postData("api_user_profile", { token: tokens });
        const profile = getApiData(response);
        if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
          setUserProfile(profile);
          setToken(profile.token || tokens);
          setDayProfitLimit(profile.day_profit_limit || '');
          setDayLossLimit(profile.day_loss_limit || '');
          setTradeLimit(profile.trade_limit || '');
        }
      } catch (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        setError(fetchError.message || 'Unable to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [tokens]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await postData("api_user_profile", {
        token,
        day_profit_limit: dayProfitLimit,
        day_loss_limit: dayLossLimit,
        trade_limit: tradeLimit,
      });
      if (response?.success === false) {
        throw new Error(response.message || "Update failed. Try again.");
      }
      toast.success("Trading limits updated!");
      setUserProfile(getApiData(response) || userProfile);
    } catch (submitError) {
      console.error('Error updating trading limits:', submitError);
      toast.error(submitError.message || "Update failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const riskEnforced = toBooleanFlag(userProfile.risk_enforced ?? userProfile.risk_limits_enforced ?? userProfile.risk_enabled ?? true);
  const liveEnabled = toBooleanFlag(userProfile.live_enabled ?? userProfile.live_trading_enabled ?? userProfile.live);
  const missingRiskLimits = !dayLossLimit || !tradeLimit;

  return (
    <div className="uppercase lg:px-6 px-3 py-4">
      <h1 className="text-2xl font-bold mb-6 max-lg:mt-14">User Profile</h1>
      {loading && <LoadingState label="Loading profile..." />}
      {error && <div className="mb-4"><ErrorState message={error} /></div>}
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
        <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Trading Limit Settings</h2>
          <StatusBadge value={riskEnforced ? "Enforced" : "Not enforced"} tone={riskEnforced ? "ready" : "warning"} />
        </div>
        <div className="bg-gray-200 mb-6 border-b-2"></div>

        <div className="px-5 pb-4 max-md:px-2">
          <RiskSummaryCard strategy={{ live: liveEnabled, lot: userProfile.max_quantity || userProfile.max_qty || userProfile.quantity }} user={{ day_loss_limit: dayLossLimit, trade_limit: tradeLimit }} />
          {liveEnabled && missingRiskLimits ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 normal-case text-sm font-semibold text-red-700">
              Live trading appears enabled without complete visible risk limits. Set a day loss limit and trade limit before live use.
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6 max-md:px-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <label className="block font-medium text-[#79829E]">Day Profit Limit</label>
            <p className="mb-2 text-xs normal-case text-[#4B5675]">Optional daily profit target for stopping new trades after gains.</p>
            <input type="number" value={dayProfitLimit} onChange={(e) => setDayProfitLimit(e.target.value)} className="border px-3 py-2 rounded-md w-full" placeholder="Enter day profit limit" />
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <label className="block font-medium text-[#79829E]">Day Loss Limit</label>
            <p className="mb-2 text-xs normal-case text-[#4B5675]">Maximum daily loss allowed before risk controls should stop trading.</p>
            <input type="number" value={dayLossLimit} onChange={(e) => setDayLossLimit(e.target.value)} className="border px-3 py-2 rounded-md w-full" placeholder="Enter day loss limit" />
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <label className="block font-medium text-[#79829E]">Trade Limit</label>
            <p className="mb-2 text-xs normal-case text-[#4B5675]">Maximum trades allowed in the configured trading window.</p>
            <input type="number" value={tradeLimit} onChange={(e) => setTradeLimit(e.target.value)} className="border px-3 py-2 rounded-md w-full" placeholder="Enter trade limit" />
          </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 text-sm w-fit"
            >
              {submitting ? 'Updating...' : 'Update Limits'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
