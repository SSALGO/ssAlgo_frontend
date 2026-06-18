import React, { useEffect, useState } from "react";
import { postData } from "../../../api";
import EditStrategyInput from "./EditStrategyInput";
import { EmptyState, ErrorState, LoadingState, MetricCard, StatusBadge } from "../../../components/common/TradingUi";

// Move the controlDashboardData and strategyInputData declarations above the state initialization
const controlDashboardData = [
  { symbol: "BANKNIFTY" },
  { symbol: "NIFTY" },
  { symbol: "FINNIFTY" },
  { symbol: "MIDCPNIFTY" },
];

const AdminDashboard = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [strategyInputData, setStrategyInputData] = useState([]);
  const [editdata, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize states using the above data
  const [controlStates, setControlStates] = useState(
    controlDashboardData.reduce((acc, item) => {
      acc[item.symbol] = "Start"; // Default state for control buttons
      return acc;
    }, {})
  );

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await postData("api_admin", { token });
      setStrategyInputData(Array.isArray(response?.data?.strategyco) ? response.data.strategyco : []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load admin dashboard.");
      setStrategyInputData([]);
    } finally {
      setLoading(false);
    }
  };
  const closeEdit = () => {
    setShowEdit(false);
  };

  const handlemodify = (item) => {
    setEditData(item);

    // Logic to modify the strategy
    setShowEdit(true);
    // console.log(`Modify strategy at index ${id}`);
  };
  const [tradeStates, setTradeStates] = useState(
    controlDashboardData.reduce((acc, item) => {
      acc[item.symbol] = { buy: "Buy", sell: "Sell" }; // Default states for trade buttons
      return acc;
    }, {})
  );

  const [strategyStates, setStrategyStates] = useState(
    strategyInputData.reduce((acc, item) => {
      acc[item.symbol] = "Off"; // Default state for strategy buttons
      return acc;
    }, {})
  );

  const handleStrategyClick = async (symbol) => {
    const apiEndpoint =
      strategyStates[symbol] === "Off"
        ? "api_start_strategyco"
        : "api_stop_strategyco";

    try {
      const response = await postData(apiEndpoint, { strategy: symbol, token });

      // Check if the API call was successful
      if (response.success === true) {
        // Update the state after a successful API call
        setStrategyStates((prevStates) => ({
          ...prevStates,
          [symbol]: prevStates[symbol] === "Off" ? "On" : "Off",
        }));
      } else {
        console.error("API request failed.");
      }
    } catch (error) {
      console.error("Error during API request", error);
    }
  };

  const token = localStorage.getItem("token");
  const handleControlClick = (symbol) => {
    // console.log(controlStates[symbol]);
    const response =
      controlStates[symbol] === "Start"
        ? postData("api_start_control", { symbol, token })
        : postData("api_stop_control", { symbol, token });
    // console.log(response);

    setControlStates((prevStates) => ({
      ...prevStates,
      [symbol]: prevStates[symbol] === "Start" ? "Stop" : "Start",
    }));
  };

  const handleTradeClick = (symbol, type) => {
    // Determine the API endpoint based on trade type and current state
    let apiEndpoint = "";

    if (type === "buy") {
      apiEndpoint =
        tradeStates[symbol].buy === "Buy"
          ? "api_start_cebuy"
          : "api_start_cesell";
    } else {
      apiEndpoint =
        tradeStates[symbol].sell === "Sell"
          ? "api_start_pesell"
          : "api_start_pesell";
    }

    // Make the API call with the selected endpoint
    const response = postData(apiEndpoint, { symbol, token });

    // console.log(response); // Log the response for debugging

    // Update the state after making the API call
    setTradeStates((prevStates) => ({
      ...prevStates,
      [symbol]: {
        ...prevStates[symbol],
        [type]:
          prevStates[symbol][type] === (type === "buy" ? "Buy" : "Sell")
            ? type === "buy"
              ? "Exit Buy"
              : "Exit Sell"
            : type === "buy"
            ? "Buy"
            : "Sell",
      },
    }));
  };

  const handleOnClick = async (strategy) => {
    // const token = localStorage.getItem("token");
    const response = await postData("api_start_strategyco", {
      strategy,
      token,
    });
    fetchAdminData();
  };
  const handleOffClick = async (strategy) => {
    // const token = localStorage.getItem("token")
    const response = await postData("api_stop_strategyco", { strategy, token });
    fetchAdminData();
  };

  const renderActions = (row) => {
    if (row.update === false) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleOnClick(row.strategy)}
            className="px-3 max-md:text-[12px]  font-bold text-sm py-1 bg-[#43C64C] text-white rounded hover:bg-green-600 flex gap-2 items-center"
          >
            {/* <img src="./play.svg" alt="play" /> */}
            On
          </button>
          <button
            onClick={() => handlemodify(row)}
            className="px-3 max-lg:px-2  py-1  max-md:text-[12px]  bg-[#3985FF] font-bold text-sm justify-center text-white rounded hover:bg-blue-600 flex gap-2 items-center"
          >
            {/* <img src="edit.svg" alt="edit" /> */}
            Modify
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleOffClick(row.strategy)}
            className="px-3 max-md:text-[12px] font-bold text-sm py-1 bg-[#EE2358] text-white rounded hover:bg-red-600 flex gap-2 items-center"
          >
            {/* <img src="play.svg" alt="play" /> */}
            Off
          </button>

          <button
            onClick={() => handlemodify(row)}
            className="px-3 max-lg:px-2 py-1 max-md:text-[12px] bg-[#3985FF] font-bold text-sm justify-center text-white rounded hover:bg-blue-600 flex gap-2 items-center"
          >
            {/* <img src="edit.svg" alt="edit" /> */}
            Modify
          </button>
        </div>
      );
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);
  return (
    <>
      {showEdit ? (
        <EditStrategyInput editdata={editdata} closeEdit={closeEdit} />
      ) : (
        <div className="uppercase w-full px-6 max-lg:px-3 py-4">
          <h1 className="text-2xl font-bold text-[#0A1438] max-lg:mt-14">
            Admin Dashboard
          </h1>
          <p className="text-[#4B5675] mt-1">
            Monitor, manage, and optimize AI-driven trading algorithms in
            real-time.
          </p>

          <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label="Users" value="API placeholder" status="warning" />
            <MetricCard label="Subscriptions" value="API placeholder" status="warning" />
            <MetricCard label="Broker status" value="API placeholder" status="warning" />
            <MetricCard label="Strategy count" value={strategyInputData.length} status={strategyInputData.length ? "active" : "paused"} />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-[#79829E]">Audit log</p><StatusBadge value="API not ready" tone="warning" /></div>
            <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-[#79829E]">Risk review</p><StatusBadge value="API not ready" tone="warning" /></div>
            <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-[#79829E]">Admin actions</p><StatusBadge value="Manual controls only" tone="ready" /></div>
          </div>

          {loading ? <LoadingState label="Loading admin dashboard..." /> : null}
          {error ? <ErrorState message={error} onRetry={fetchAdminData} /> : null}

          {!loading && !error ? <div className="flex-1">
            <h2 className="text-2xl font-bold mt-3 mb-6 text-[#0A1438]">
              Control Dashboard
            </h2>
            <div className="border-2 rounded-lg mb-6 overflow-x-auto">
              <div className="overflow-y-auto h-full">
                <table className="w-full table-fixed">
                  <thead className="bg-white">
                    <tr className="text-[#79829E] text-sm">
                      <th className=" max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm  text-left text-[#79829E] border-b-2 border-r-2">
                        SYMBOL
                      </th>
                      <th className="px-5 max-lg:py-2 py-3  max-lg:px-2 font-medium max-md:text-[12px] text-nowrap text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        CONTROL
                      </th>
                      <th className="px-5 max-lg:py-2 py-3  max-lg:px-2 font-medium text-nowrap text-sm max-md:text-[12px] text-left text-[#79829E] border-b-2 border-r-2">
                        BUY TRADE
                      </th>
                      <th className="px-5 max-lg:px-2 max-lg:py-2 py-3  text-nowrap font-medium text-sm max-md:text-[12px] text-left text-[#79829E] border-b-2">
                        SELL TRADE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-dashed">
                    {controlDashboardData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-5 max-lg:px-2 max-lg:py-2 py-3   text-sm max-md:text-[12px] text-[#252F4A] text-wrap font-medium">
                          {item.symbol}
                        </td>
                        <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm max-md:text-[12px] text-[#252F4A] text-wrap font-medium">
                          <button
                            onClick={() => handleControlClick(item.symbol)}
                            className={`text-white px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded ${
                              controlStates[item.symbol] === "Start"
                                ? "bg-[#43C64C]"
                                : "bg-red-500"
                            }`}
                          >
                            {controlStates[item.symbol]} {/* Button text */}
                          </button>
                        </td>
                        <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm max-md:text-[12px] text-[#252F4A] text-wrap font-medium">
                          <button
                            onClick={() => handleTradeClick(item.symbol, "buy")}
                            className={`text-white max-lg:px-2 py-1 px-4 max-md:py-[2px] rounded ${
                              tradeStates[item.symbol].buy === "Buy"
                                ? "bg-[#3985FF]"
                                : "bg-red-500"
                            }`}
                          >
                            {tradeStates[item.symbol].buy} {/* Button text */}
                          </button>
                        </td>
                        <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          <button
                            onClick={() =>
                              handleTradeClick(item.symbol, "sell")
                            }
                            className={`text-white max-lg:px-2 py-1 px-4 max-md:py-[2px] rounded ${
                              tradeStates[item.symbol].sell === "Sell"
                                ? "bg-red-500"
                                : "bg-[#43C64C]"
                            }`}
                          >
                            {tradeStates[item.symbol].sell} {/* Button text */}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#0A1438]">
              STRATEGY INPUT DASHBOARD
            </h2>
            <div className="border-2 rounded-lg my-6 overflow-x-auto">
              <div className=" h-full">
                <table className="w-full table-auto">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-[#79829E] text-sm">
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        CONTROL
                      </th>
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        SYMBOL
                      </th>
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        R1
                      </th>
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        K1
                      </th>
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        R2
                      </th>
                      <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2 border-r-2">
                        K2
                      </th>
                      <th className="py-3 px-5 font-medium text-sm text-center text-[#79829E] border-b-2 border-r-2">
                        TF
                      </th>
                      {/* <th className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2">
                    Control
                  </th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dashed">
                    {strategyInputData.map((item, index) => (
                      <tr key={index}>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium flex">
                          {renderActions(item)}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.strategy}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.r1}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.k1}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.r2}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.k2}
                        </td>
                        <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium">
                          {item.timeframe}
                        </td>
                        {/* <td className="max-lg:py-2 py-3  px-5 max-lg:px-2 max-md:text-[12px] whitespace-nowrap text-sm text-[#252F4A] text-wrap font-medium flex">
                          {renderActions(item)} */}
                        {/* <button
                        onClick={() => handlemodify(item)}
                        className="bg-[#3985FF] text-white pl-2 pr-4 py-1 rounded mr-2 flex gap-1 items-center"
                      >
                        <img src="/edit.svg" alt="edit" className="" />
                        Modify
                      </button>
                      <button
                        onClick={() => handleStrategyClick(item.strategy)}
                        className={`px-4 py-1 rounded flex gap-1 items-center text-white ${
                          strategyStates[item.symbol] === "Off"
                            ? "bg-[#43C64C]"
                            : "bg-red-500"
                        }`}
                      >
                        {strategyStates[item.symbol] === "Off" ? (
                          <>
                            <img src="/edit.svg" alt="On" className="" />
                            On
                          </>
                        ) : (
                          <>
                            <img src="/edit.svg" alt="Off" className="" />
                            Off
                          </>
                        )}
                      </button> */}
                        {/* </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {strategyInputData.length === 0 ? <div className="p-4"><EmptyState title="No strategy inputs found" description="Admin strategy rows will appear when the backend returns strategy control data." /></div> : null}
              </div>
            </div>
          </div> : null}
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
