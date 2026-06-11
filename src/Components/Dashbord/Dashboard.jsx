import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { postData } from "../../api";
import DeletePopup from "../PopUp/DeletePopup";
import {
  displayValue,
  getApiData,
  normalizeRecords,
  toBooleanFlag,
  toObject,
} from "../../utils/displayValue";

import { AlertTriangle, Bot, ChevronDown, CircleDollarSign, Loader2, PlugZap, ShieldCheck, Wifi } from "lucide-react";
import DynamicForm from "../Forms/DynamicForm";
import DynamicEditForm from "../Forms/DynamicEditForm";
import LoadingSpinner from "../LoadingSpinner";
import {
  ConfirmLiveActionModal,
  EmptyState,
  ErrorState,
  MetricCard,
  StatusBadge,
} from "../../shared/components/TradingUi";
const Dashboard = ({ changeUserTypeToAdmin,user,headerData }) => {

  const [showEditForm, setShowEditForm] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);

  // console.log(user)

  const [loading, setLoading] = useState(true);

  const [strategyDropdown, setStrategyDropdown] = useState(false);
  const [BrokerDropdown,setBrokerDropdown] = useState(false)
  const [ShowDynamicForm, setShowDynamicForm] = useState(false);
  const [userlog,setUserLog]=useState(false)
  const [allStrategy,setAllStrategy]= useState({});
  const [editData, setEditData] = useState({});
  const [StrategyData, setStrategyData] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [expiryDate, setExpiryDate] = useState("")
  const [brokers,setBrokers]=useState({})
  const [brokerHealth,setBrokerHealth]=useState({})
  const [tradingRuntime,setTradingRuntime]=useState({})
  const [dashboardError, setDashboardError] = useState("")
  const [pendingLiveStrategy, setPendingLiveStrategy] = useState(null);
  const [busyStrategyId, setBusyStrategyId] = useState("");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    window.location.reload();
  }

  const toggleStrategyDropdown = () => {
    setStrategyDropdown(!strategyDropdown);
  };

  const toggleBrokerDropdown = () => {
    setBrokerDropdown(!BrokerDropdown)
  }

  useEffect(() => {
    fetchIndex();
  }, []);

  const exitPosition = async (id) => {
   const token = localStorage.getItem("token");
   const response = await postData("api_delete_oposition", { position_time: id, token });
 }
  const fetchIndex = async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    setDashboardError("");
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_index", { token });
      const indexData = getApiData(response) || {};
      setStrategies(normalizeRecords(indexData.strategy));
      setOpenPositions(normalizeRecords(indexData.opositions));
      const brokerLoginStatus = displayValue(indexData.broker_health?.login_status).toLowerCase();
      setUserLog(
        brokerLoginStatus
          ? brokerLoginStatus === "connected"
          : toBooleanFlag(indexData.userlog)
      );
      headerData(indexData);
      setExpiryDate(displayValue(indexData.user_expiry));
      setBrokers(toObject(indexData.brokers));
      setBrokerHealth(toObject(indexData.broker_health));
      setTradingRuntime(toObject(indexData.trading_runtime));
      setAllStrategy(toObject(indexData.allstrategies));
      // console.log("all strategy",allStrategy)
      // console.log("admin broker data",brokers)

    } catch (error) {
      console.error("Error fetching APIs:", error);
      setDashboardError(error.message || "Unable to load dashboard data.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const closeDropdown = () => {
    setStrategyDropdown(false);
    // setEquityStrategyDropdown(false);
    setBrokerDropdown(false)
  };

  const tableHeaders = [
    "ACTIONS",
    // "Time",
    "BOT",
    // "STRATEGY",
    "SYMBOL",
    "TF",
    "Live",
    "LOTS",
    "DURATION",
    "B/S MODE",
    // "Status",
  ];

  const table2Headers = [
    "ACTION",
    "PNL",
    "TIME",
    "BOT",
    "SYMBOL",
    // "SLTP",
    // "LTP",
    "LIVE",
    "LOTS",
    "B/S",
    "Mode",
    "DURATION",
    // "Status",
  ];

  const runStartStrategy = async (id) => {
    const token = localStorage.getItem("token");
    const response = await postData("api_start_ssalgo", { id, token });
    const responseData = getApiData(response) || {};
    const message = response?.message || "Strategy started successfully.";
    if (responseData.runtime_ready === false) {
      toast.warning(message);
    } else {
      toast.success(message);
    }
    await fetchIndex({ showLoading: false });
  };

  const handleStartClick = async (row) => {
    if (toBooleanFlag(row.live)) {
      setPendingLiveStrategy(row);
      return;
    }
    try {
      setBusyStrategyId(row.botcode);
      await runStartStrategy(row.botcode);
    } catch (error) {
      toast.error(error.message || "Unable to start the strategy.");
    } finally {
      setBusyStrategyId("");
    }
  };

  const confirmLiveStart = async () => {
    if (!pendingLiveStrategy) return;
    const strategyId = pendingLiveStrategy.botcode;
    try {
      setBusyStrategyId(strategyId);
      await runStartStrategy(strategyId);
      setPendingLiveStrategy(null);
    } catch (error) {
      toast.error(error.message || "Unable to start live strategy.");
    } finally {
      setBusyStrategyId("");
    }
  };

  const handleStopClick = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await postData("api_stop_ssalgo", { id, token });
      toast.success("Strategy stopped successfully.");
      fetchIndex();
    } catch (error) {
      toast.error(error.message || "Unable to stop the strategy.");
    }
  };


  const OpenForm = async (strategy) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_add_strategy_form", {
        strategy,
        token,
      });

      const form = getApiData(response);
      if (form && Array.isArray(form.page)) {
        if (!form.page.length) {
          throw new Error("This strategy form is unavailable. Deploy the updated backend and retry.");
        }

        if (Number(form.StrategyRemaining) > 0) {
          setStrategyData(form);
          setShowDynamicForm(true);
          setShowEditForm(false);
          closeDropdown();
        } else {
          toast.error("You have reached your strategy limit.");
          closeDropdown();
        }
      } else {
        throw new Error("Invalid strategy form response from the server.");
      }
    } catch (error) {
      console.error("Error in fetching strategy form data:", error);
      toast.error(error.message || "Unable to load the strategy form.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setShowDynamicForm(false);
    setShowEditForm(false);
  };

  const handleDeletClick = (row) => {
    setItemToDelete(row);

    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");

    setShowDeletePopup(false);

    try {
      await postData("api_delete_strategy", {
        id: itemToDelete,
        token,
      });
      toast.success("Strategy deleted successfully.");
      await fetchIndex();
    } catch (error) {
      toast.error(error.message || "Unable to delete the strategy.");
    }

  };


  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  const OnModify = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await postData(`api_edit_strategy_form/${data.botcode}`, {
        token,
      });
      const form = getApiData(response);
      if (!form?.page?.length) {
        throw new Error("The edit form is unavailable for this strategy.");
      }
      setEditData(form);
      setShowEditForm(true);
    } catch (error) {
      toast.error(error.message || "Unable to edit the strategy.");
    } finally {
      setLoading(false);
    }
  };



  function convertToCapital(str) {
    return str.toUpperCase();
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  const day = String(today.getDate()).padStart(2, '0');

  // Format date as YYYY-MM-DD
  const today_date = `${year}-${month}-${day}`;
  // console.log(today_date)
  const renderActions = (row) => {
    const isStarting = busyStrategyId === row.botcode;
    if (row.status === "paused") {
      return (
        <>
          {Boolean(expiryDate && expiryDate > today_date) && (
         <button
         onClick={() => handleStartClick(row)}
         disabled={isStarting}
         className={`uppercase pr-5 max-lg:pr-5 max-lg:px-2 gap-2 max-md:text-[12px] font-bold text-sm py-1 text-white rounded flex items-center disabled:cursor-not-allowed disabled:opacity-60 ${
          toBooleanFlag(row.live) ? "bg-red-700 hover:bg-red-800" : "bg-[#43C64C] hover:bg-green-600"
         }`}
       >
         {isStarting ? (
           <Loader2 size={14} className="ml-2 animate-spin" />
         ) : (
           <img src="play1.png" alt="play" className="h-3 pl-2 " />
         )}
         {isStarting ? "Starting..." : toBooleanFlag(row.live) ? "Start Live" : "Start"}
       </button>
          )}

          <button
            onClick={() => OnModify(row)}
            className=" uppercase pr-3  max-md:text-[12px]  bg-[#3985FF] font-bold text-sm justify-center text-white rounded hover:bg-blue-600 flex gap-2 items-center"
          >
            <img src="edit.svg" alt="play" className="pl-3" />
            Modify
          </button>
          <button
            onClick={() => handleDeletClick(row.botcode)}
            className="uppercase px-3 pr-5 max-lg:pr-5  max-lg:px-2  py-1 bg-[#EE2358] font-bold text-sm max-md:text-[12px] text-white rounded hover:bg-red-600 flex gap-1 items-center"
          >
            <img src="delete.svg" alt="play" />
            Delete
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            onClick={() => handleStopClick(row.botcode)}
            className="uppercase max-md:text-[12px] pr-3 gap-2  font-bold text-sm py-1 bg-[#EE2358] text-white rounded hover:bg-red-600 flex  items-center"
          >
            <img src="play1.png" alt="play" className="h-3 pl-2 " />
            Stop
          </button>
          <button
            onClick={() => OnModify(row)}
            className="uppercase px-3 max-lg:px-2  py-1  max-md:text-[12px]  bg-[#3985FF] font-bold text-sm justify-center text-white rounded hover:bg-blue-600 flex gap-2 items-center"
          >
            <img src="edit.svg" alt="play" />
            Modify
          </button>
        </>
      );
    }
  };

  const activeStrategies = strategies.filter((strategy) => strategy.status !== "paused").length;
  const todaysPnl = openPositions.reduce((sum, position) => sum + (Number(position.pnl) || 0), 0);
  const rejectedOrders = [...strategies, ...openPositions].filter((item) =>
    String(item.status || item.order_status || "").toLowerCase().includes("reject")
  ).length;
  const brokerStatus = toBooleanFlag(userlog) ? "connected" : "missing";
  const feedStatus = displayValue(brokerHealth.websocket_status || "unknown").toLowerCase();
  const strategyEngineStatus = displayValue(tradingRuntime.strategy_engine || tradingRuntime.state || "unknown").toLowerCase();
  const strategyEngineReady = strategyEngineStatus === "running" && tradingRuntime.healthy === true;
  const hasRiskLimits = Boolean(user?.day_loss_limit || user?.trade_limit || user?.max_loss || user?.max_trades);
  const hasLiveStrategies = strategies.some((strategy) => toBooleanFlag(strategy.live));
  const riskStatus = hasLiveStrategies && !hasRiskLimits ? "warning" : "ready";

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <>
      {dashboardError && <div className="mx-6 mt-4"><ErrorState message={dashboardError} onRetry={fetchIndex} /></div>}
      <header className="relative z-50 max-lg:pt-16">
        <nav className="relative z-50 flex justify-between items-center py-4 px-6 max-lg:px-3">
          <div className="flex space-x-8 relative z-50">
            <button
              onClick={() => OpenForm("add_rf_form")}
              className="text-[#FF5733] text-lg font-bold uppercase max-md:text-sm"
            >
              Algo Auto
            </button>

            {/* <div className="relative">
              <button
                className="text-[#FF5733] text-lg font-bold flex items-center"
                onClick={toggleEquityStrategyDropdown}
              >
                Add Equity Strategy
                <ChevronDown size={16} className="ml-1 mt-1" />
              </button>
              {equityStrategyDropdown && (
                <div className="absolute mt-2  border   rounded shadow-lg z-10">
                  <button
                    onClick={() => OpenForm("add_ssequityfno_eq_form")}
                    className="block text-nowrap px-4 py-2 text-sm text-gray-700 font-semibold "
                  >
                    EQUITY OPTIONS FUTURE
                  </button>
                </div>
              )}
            </div> */}

            <div className="relative z-50">
              <button
                className="text-[#FF5733] text-lg font-bold flex items-center max-md:text-sm "
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStrategyDropdown();
                }}
              >
                ADD STRATEGY
                <ChevronDown size={16} className="ml-1" />
              </button>

              {strategyDropdown && (
                <div
                  className="absolute left-0 top-full mt-2 min-w-56 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-xl z-[9999]"
                  onClick={(event) => event.stopPropagation()}
                >
                  {Object.entries(allStrategy).length > 0 ? (
                    Object.entries(allStrategy).map(([name, formId], index) => (
                      <button
                        key={`${name}-${index}`}
                        onClick={() => OpenForm(formId)}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#252F4A] hover:bg-[#FFF0EC] hover:text-[#FF5733]"
                      >
                        {convertToCapital(name)}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-sm font-semibold text-gray-500">
                      No strategies available
                    </div>
                  )}
                </div>
              )}
              {/* {strategyDropdown && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => OpenForm("add_rf_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      SSAUTO Options
                    </button>
                    <button
                      onClick={() => OpenForm("add_ssalgo_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      SSALGOHF Options
                    </button>
                    <button
                      onClick={() => OpenForm("add_ema_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      143 Options
                    </button>
                    <button
                      onClick={() => OpenForm("add_sstrike_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      M143153
                    </button>
                    <hr/>
                    <button
                      onClick={() => OpenForm("add_ssalgo_fut_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      Index FUTURE SSALGO
                    </button>
                    <button
                      onClick={() => OpenForm("add_ema_fut_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      Index FUTURE 143
                    </button>
                    <button
                      onClick={() => OpenForm("add_eqssalgo_form")}
                      className="block px-4 py-2 text-sm text-gray-700 "
                    >
                      SSALgo form
                    </button>
                  </div>
                </div>
              )} */}
            </div>

            <button
              onClick={() => OpenForm("add_ssequity_eq_form")}
              className= "uppercase text-[#FF5733] text-lg font-bold max-md:text-sm "
            >
              CharTink
            </button>
          </div>

          <div className="  flex space-x-4 max-lg:hidden">
           <div>
            {!toBooleanFlag(userlog) &&
            ( <button onClick={toggleBrokerDropdown} className="px-4 py-2 border text-[#FF5733] border-[#FF5733] rounded hover:bg-blue-100">
              LOGIN WITH  YOUR  BROKER
          </button>)}

            {BrokerDropdown && (
                <div className="absolute mt-2 bg-white border   rounded shadow-lg z-10">
               {Object.entries(brokers).map(([name, url], index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className=" uppercase block px-4 py-2 text-gray-700 hover:bg-blue-100"
            >
              {name}
            </a>
          ))}
                </div>
              )}
            </div>
            {toBooleanFlag(userlog) ? (


              <div className="px-4 py-2 max-lg:px-2 max-lg:py-1   max-lg:text-[12px] bg-[#2cc12c] text-white rounded">
                VERIFIED
                {/* {console.log("userlog in header", userlog)} */}
              </div>
             ) : null}
             <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#FF5733] text-white rounded"
            >
              LOGOUT
              </button>
            {toBooleanFlag(user?.admin) ? (
            <button
              onClick={changeUserTypeToAdmin}
              className="px-4 py-2 bg-[#FF5733] text-white rounded"
            >
              GO TO ADMIN
              </button>
             ) : null}
          </div>
        </nav>
      </header>



      <div onClick={closeDropdown} className="py-4 px-6 max-lg:px-3 w-full">

        {!ShowDynamicForm && !showEditForm && (
          <div className="uppercase max-lg:mt-1">
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Broker connection" value={toBooleanFlag(userlog) ? "Connected" : "Not connected"} status={brokerStatus} icon={<PlugZap size={18} />} />
              <MetricCard label="Live feed" value={feedStatus === "connected" ? "Receiving data" : "No active feed"} status={feedStatus} icon={<Wifi size={18} />} />
              <MetricCard label="Active strategies" value={activeStrategies} status={activeStrategies ? "active" : "paused"} icon={<Bot size={18} />} />
              <MetricCard label="Today's P&L" value={todaysPnl} status={todaysPnl < 0 ? "warning" : "ready"} icon={<CircleDollarSign size={18} />} />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Open positions" value={openPositions.length} status={openPositions.length ? "active" : "paused"} />
              <MetricCard label="Rejected orders" value={rejectedOrders} status={rejectedOrders ? "rejected" : "ready"} />
              <MetricCard label="Risk status" value={riskStatus === "ready" ? "Limits ready" : "Needs review"} status={riskStatus} icon={<ShieldCheck size={18} />} />
              <MetricCard label="Strategy runtime" value={strategyEngineReady ? "Running" : strategyEngineStatus} status={strategyEngineReady ? "active" : "failed"} icon={<Bot size={18} />} />
            </div>

            {activeStrategies && !strategyEngineReady ? (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 normal-case text-red-900">
                <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                <p className="text-sm font-semibold">
                  Strategies are marked active, but the strategy runtime is not running. No signals or orders will be generated.
                </p>
              </div>
            ) : null}

            {hasLiveStrategies && !hasRiskLimits ? (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 normal-case text-amber-900">
                <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                <p className="text-sm font-semibold">
                  Live trading is enabled for at least one strategy, but risk limits are not fully visible in your profile data.
                </p>
              </div>
            ) : null}

            <h2 className="text-2xl font-bold mb-4 text-[#0A1438]">Strategy Table</h2>
            {strategies.length === 0 ? (
              <EmptyState
                title="No strategy exists yet"
                description="Create a strategy first. Paper trading is the safest place to validate the setup before any live broker action."
                actions={(
                  <>
                    <button onClick={() => OpenForm("add_rf_form")} className="rounded-md bg-[#FF5733] px-4 py-2 text-sm font-bold text-white">Create Strategy</button>
                    <a href="/api" className="rounded-md border border-[#FF5733] px-4 py-2 text-sm font-bold text-[#FF5733]">Connect Broker</a>
                  </>
                )}
              />
            ) : (
            <div className="bg-white rounded-lg overflow-x-auto border border-slate-200">
              <table className="min-w-full border-2 rounded-lg">
                <thead className="">
                  <tr className="text-[#79829E]  text-sm">
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-5 max-lg:px-2 max-lg:py-2 py-3   max-md:text-[12px] font-medium text-sm  text-left  text-[#79829E] border-r-2 border-b-2 text-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed">
                  {strategies.map((strategy) => (
                    <tr key={strategy.id} className="font-medium ">
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap space-x-3 flex">
                        {renderActions(strategy)}
                      </td>
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">

                        {strategy.time}
                      </td> */}
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(strategy.botname)}
                      </td>
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {strategy.strategy}
                      </td> */}
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {strategy.symbol}
                      </td> */}
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
  {Array.isArray(strategy['symbol[]']) ? (
    <select className="border border-gray-300 rounded px-2 py-1">
     {strategy['symbol[]'].map((item, idx) => (
  <option key={`${displayValue(item)}-${idx}`} value={displayValue(item)}>
    {displayValue(item)}
  </option>
))}
    </select>
  ) : (
    displayValue(strategy.symbol)
  )}
</td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(strategy.timeframe)}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        <StatusBadge value={strategy.live ? "Live" : "Paper"} tone={strategy.live ? "live" : "paper"} />
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(strategy.lot)}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {strategy.Intraday?"IntraDay":"Positional"}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {strategy.BSmode ? "Buyer" : "Seller"}
                        {/* {console.log(strategy.BSmode)} */}
                      </td>
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {strategy.status}
                      </td> */}
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap space-x-3 flex">
                        {renderActions(strategy)}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            <h2 className="text-2xl font-bold my-4 text-[#0A1438]">
              Live Positions
            </h2>

            {openPositions.length === 0 ? (
              <EmptyState title="No open positions" description="Positions will appear here once a paper or live strategy opens a trade." />
            ) : (
            <div className="bg-white rounded-lg mb-96 overflow-x-auto border border-slate-200">
              <table className="min-w-full border-2  ">
                <thead className="">
                  <tr className="text-[#79829E]  text-sm">
                    {table2Headers.map((header) => (
                      <th
                        key={header}
                        className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] font-medium text-sm  text-left  text-[#79829E] border-r-2 border-b-2 text-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed ">
                  {openPositions.map((position, index) => (
                    <tr
                      key={index}
                      className="font-medium"
                      // className={position.pnl >= 0 ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        <button onClick={()=>exitPosition(position.entry_id)} className="px-3 max-lg:px-2  py-1  max-md:text-[12px] bg-[#EE2358] text-white rounded hover:bg-red-600">
                          Exit
                        </button>
                        {/* {console.log("kya haal h bhai ",position)} */}
                      </td>
                      <td
                        className={`px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap ${
                          position.pnl >= 0
                            ? "text-[#43C64C]"
                            : "text-[#EE2358]"
                        } font-bold`}
                      >
                        {displayValue(position.pnl)}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                      {position.time ? new Date(position.time * 1000).toLocaleTimeString() : ''}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(position.botname)}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(position.optionname)}
                      </td>
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {position.optionexit}
                      </td> */}
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {position.current_price}
                      </td> */}
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        <StatusBadge value={position.live ? "Live" : "Paper"} tone={position.live ? "live" : "paper"} />
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(position.lot)}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {displayValue(position.side)}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        { position.BSmode ? "Buy" : "Sell"}
                      </td>
                      <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        { (position.intraday ? "Intraday" : "Positional")}
                      </td>
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        {position.status}
                      </td> */}
                      {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap">
                        <button className="px-3 max-lg:px-2  py-1  max-md:text-[12px] bg-[#EE2358] text-white rounded hover:bg-red-600">
                          Exit
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {ShowDynamicForm && (
          <DynamicForm formData={StrategyData} onClose={onClose} />
        )}
        {showEditForm && (
          <DynamicEditForm formData={editData} onClose={onClose} />
        )}

        {showDeletePopup && (
          <DeletePopup
            onCancel={cancelDelete}
            onDelete={confirmDelete}
            data="Startegy"
          />
        )}
      </div>

      <ConfirmLiveActionModal
        open={Boolean(pendingLiveStrategy)}
        strategy={pendingLiveStrategy}
        user={user}
        onCancel={() => setPendingLiveStrategy(null)}
        onConfirm={confirmLiveStart}
        isSubmitting={Boolean(busyStrategyId)}
      />


    </>
  );
};

export default Dashboard;
