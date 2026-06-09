import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { postData } from "../../api";
import DeletePopup from "../PopUp/DeletePopup";
import {
  displayValue,
  getApiData,
  normalizeRecords,
  toArray,
  toBooleanFlag,
  toObject,
} from "../../utils/displayValue";

import { ChevronDown } from "lucide-react";
import DynamicForm from "../Forms/DynamicForm";
import DynamicEditForm from "../Forms/DynamicEditForm";
import ClipLoader from "react-spinners/ClipLoader";
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
  const fetchIndex = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_index", { token });
      const indexData = getApiData(response) || {};
      setLoading(false);
      setStrategies(normalizeRecords(indexData.strategy));
      setOpenPositions(normalizeRecords(indexData.opositions));
      setUserLog(toBooleanFlag(indexData.userlog));
      headerData(indexData);
      setExpiryDate(displayValue(indexData.user_expiry));
      setBrokers(toObject(indexData.brokers));
      setAllStrategy(toObject(indexData.allstrategies));
      // console.log("all strategy",allStrategy)
      // console.log("admin broker data",brokers)

    } catch (error) {
      console.error("Error fetching APIs:", error);
      setLoading(false);
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

  const handleStartClick = async (id) => {
    const token = localStorage.getItem("token");
    const response = await postData("api_start_ssalgo", { id, token });
    // toast.success("Strategy started successfully");

    fetchIndex();
  };
  const handleStopClick = async (id) => {
    const token = localStorage.getItem("token");
    const response = await postData("api_stop_ssalgo", { id, token });
    // toast.success("Strategy stopped successfully");
    fetchIndex();
  };


  const OpenForm = async (strategy) => {
       setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await postData("api_add_strategy_form", {
        strategy,
        token,
      });

      if (response && response.data) {
        // console.log("Strategy form data:", response.data);
        if(response.data.StrategyRemaining >= strategies.length){
          console.log("Strategy form data:", strategies.length);
          setStrategyData(response.data);
        setLoading(false);
        setShowDynamicForm(true);
        setShowEditForm(false);
        closeDropdown();
        }
        else{
          alert("You have reached the limit of strategies")
          setLoading(false);
          closeDropdown();
        }


      } else {
        console.error("No data received from the API.");
      }
    } catch (error) {
      console.error("Error in fetching strategy form data:", error);
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

  const confirmDelete = () => {
    const token = localStorage.getItem("token");

    setShowDeletePopup(false);

    const response = postData("api_delete_strategy", {
      id: itemToDelete,
      token,
    });
    // window.location.reload();
    fetchIndex();

    // toast.success("Strategy deleted successfully");

  };


  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  const OnModify = async (data) => {
    const token = localStorage.getItem("token");
    const response = await postData(`api_edit_strategy_form/${data.botcode}`, {
      token,
    });
    setEditData(response.data);
    setShowEditForm(true);
    // console.log("update form modify", response);
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
    if (row.status === "paused") {
      return (
        <>
          {Boolean(expiryDate && expiryDate > today_date) && (
         <button
         onClick={() => handleStartClick(row.botcode)}
         className="uppercase  pr-5 max-lg:pr-5  max-lg:px-2 gap-2 max-md:text-[12px]  font-bold text-sm py-1 bg-[#43C64C] text-white rounded hover:bg-green-600 flex  items-center"
       >
         <img src="play1.png" alt="play" className="h-3 pl-2 " />
         Start
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader loading={loading} size={150} aria-label="Loading Spinner" data-testid="loader" />
      </div>
    );
  }

  return (
    <>
          <ToastContainer />

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



      <div
        onClick={closeDropdown}
        className="  py-4 px-6  max-lg:px-3  w-full "
      >

        {!ShowDynamicForm && !showEditForm && (
          <div className="uppercase max-lg:mt-1">
            <h2 className="text-2xl font-bold mb-4 text-[#0A1438]">
              Strategy Table
            </h2>
            <div className=" bg-white   rounded-lg overflow-x-auto">
              <table className=" border-2 rounded-lg">
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
                        {strategy.live ? "Live" : "Paper"}
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

            <h2 className="text-2xl font-bold my-4 text-[#0A1438]">
              Live Positions
            </h2>

            <div className=" bg-white rounded-lg mb-96 overflow-x-auto">
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
                        {position.live ? "Live" : "Paper"}
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


    </>
  );
};

export default Dashboard;
