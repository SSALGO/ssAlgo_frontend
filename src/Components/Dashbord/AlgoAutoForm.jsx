

import React, { useState } from "react";
import { postData } from "../../api";

const AlgoAutoForm = () => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    botName: "",
    symbol: "Nifty",
    expiry: "Current Week",
    timeFrame: "3m",
    signal: "",
    usema: "",
    ema: "200",
    intraday: "Positional",
    fixedLot: "",
    buyerSellerMode: "Buyer",
    pctPoint: "PCT",
    exitType: "PNL Exit",
    strike: "",
    lot: "",
    initialLot: "",
    timetoawait: "",
    stepValue: "",
    multiFactor: "1",
    firstCandle: "1",
    secondCandle: "2",
    rolloverTime: "",
    startTime: "",
    exitTime: "",
    tsl: "",
    target: "",
    stoploss: "",
    botType: "Live",
    status: "Stop",
    orderSlicing: "",
    daysHead: "",
    trail: false,
    token: token,
    
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const response = postData("api_add_rf", formData);
    // console.log(formData);
    // onSubmit(formData);  
  };

  return (
    <form onSubmit={handleSubmit} className=" p-6 rounded-lg ">
      <h2 className="text-2xl font-bold mb-6 text-[#0A1438]">Add SSalgo</h2>

      <div className="grid grid-cols-4 gap-4">
        {/* Bot Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Bot Name
          </label>
          <input
            type="text"
            name="botName"
            value={formData.botName}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="Set bot name"
          />
        </div>

        {/* Symbol */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Symbol
          </label>
          <select
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option className="text-sm text-[#99A1B7] font-medium">
              NIFTY
            </option>
            <option className="text-sm text-[#99A1B7] font-medium">
              BANKNIFTY
            </option>
            <option className="text-sm text-[#99A1B7] font-medium">
              FINNIFTY
            </option>
            <option className="text-sm text-[#99A1B7] font-medium">
              MIDCPNIFTY
            </option>

          </select>
        </div>

        {/* Expiry */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Expiry
          </label>
          <select
            name="expiry"
            value={formData.expiry}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>Current Week</option>
            <option>Next Week</option>
            <option>Current Month</option>
            <option>Next Month</option>
            {/* Add other options */}
          </select>
        </div>

        {/* Time Frame */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Time Frame
          </label>
          <select
            name="timeFrame"
            value={formData.timeFrame}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>1m</option>
            <option>2m</option>
            <option>3m</option>
            <option>5m</option>
            {/* Add other options */}
          </select>
        </div>

        {/* Signal */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Signal
          </label>
          <select
            type="text"
            name="signal"
            value={formData.signal}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="New Signal"
          >
            <option className="text-sm text-[#99A1B7] font-medium">
              Current Signal
            </option>
            <option className="text-sm text-[#99A1B7] font-medium">
              New Signal
              </option>
          </select>
            
        </div>

        {/* Use MA */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Use MA
          </label>
          <select
            type="text"
            name="usema"
            value={formData.usema}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="No EMA"
          >
            <option className="text-sm text-[#99A1B7] font-medium">
            No EMA
            </option>
             
           
            <option className="text-sm text-[#99A1B7] font-medium">
              With EMA
              </option>
          </select>
        </div>

        {/* EMA */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            EMA
          </label>
          <input
            type="number"
            name="ema"
            value={formData.ema}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="200"
          />
        </div>

        {/* Intraday */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Intraday
          </label>
          <select
            name="intraday"
            value={formData.intraday}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>Positional</option>
            <option>Intraday</option>
          </select>
        </div>

        {/* Fixed Lot */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Fixed Lot
          </label>
          <select
            type="text"
            name="fixedLot"
            value={formData.fixedLot}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="FixedLot"
        >
            <option className="text-sm text-[#99A1B7] font-medium">
            FixedLot
            </option>
             
           
            <option className="text-sm text-[#99A1B7] font-medium">
              steps
              </option>
              <option className="text-sm text-[#99A1B7] font-medium">
                Doubling
              </option>
          </select>
        </div>

        {/* Buyer/Seller Mode */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Buyer/Seller Mode
          </label>
          <select
            name="buyerSellerMode"
            value={formData.buyerSellerMode}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>Buyer</option>
            <option>Seller</option>
          </select>
        </div>

        {/* PCT/Point */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            PCT/Point
          </label>
          <select
            name="pctPoint"
            value={formData.pctPoint}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>PCT</option>
            <option>Point</option>
          </select>
        </div>

        {/* Exit Type */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Exit Type
          </label>
          <select
            name="exitType"
            value={formData.exitType}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
          >
            <option>PNL Exit</option>
            <option>TP/SL Exit</option>
            {/* Add other options */}
          </select>
        </div>

        {/* Strike */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Strike
          </label>
          <input
            type="number"
            name="strike"
            value={formData.strike}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>

        {/* Lot */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Lot
          </label>
          <input
            type="number"
            name="lot"
            value={formData.lot}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>

        {/* Initial Lot */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Initial Lot
          </label>
          <input
            type="number"
            name="initialLot"
            value={formData.initialLot}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>

        {/* Time to Await */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Time to Await
          </label>
          <input
            type="number"
            name="timetoawait"
            value={formData.timetoawait}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>

        {/* Step Value */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A] ">
            Step Value
          </label>
          <input
            type="number"
            name="stepValue"
            value={formData.stepValue}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>

        {/* Multi Factor */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Multi Factor
          </label>
          <input
            type="text"
            name="multiFactor"
            value={formData.multiFactor}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="1"
            readOnly={true}
          />
        </div>

        {/* First Candle */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            First Candle
          </label>
          <input
            type="text"
            name="firstCandle"
            value={formData.firstCandle}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="1"
            readOnly={true}
          />
        </div>

        {/* Second Candle */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Second Candle
          </label>
          <input
            type="text"
            name="secondCandle"
            value={formData.secondCandle}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="2"
            readOnly={true}
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A] ">
            Order Slicing
          </label>
          <input
            type="number"
            name="OrderSlicing"
            value={formData.orderSlicing}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>


        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A] ">
            Days Head
          </label>
          <input
            type="number"
            name="DaysHead"
            value={formData.daysHead}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="0"
          />
        </div>


        {/* Rollover Time */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Rollover Time
          </label>
          <input
            type="time"
            name="rolloverTime"
            value={formData.rolloverTime}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="01:01 PM"
          />
        </div>

        {/* Start Time */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="01:01 PM"

          />
        </div>

        {/* Exit Time */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Exit Time
          </label>
          <input
            type="time"
            name="exitTime"
            value={formData.exitTime}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="01:01 PM"

          />
        </div>

        {/* TSL */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            TSL
          </label>
          <input
            type="number"
            name="tsl"
            value={formData.tsl}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="1000"

          />
        </div>

        {/* Target */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Target
          </label>
          <input
            type="number"
            name="target"
            value={formData.target}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="24999"
          />
        </div>

        {/* Stoploss */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Stoploss
          </label>
          <input
            type="number"
            name="stoploss"
            value={formData.stoploss}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="24999"

          />
        </div>

        {/* Bot Type */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Bot Type
          </label>
          <select
            name="botType"
            value={formData.botType}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 text-[#99A1B7] border-[#F1F1F4]"
          >
            <option>Live</option>
            <option>Paper</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 text-[#99A1B7] border-[#F1F1F4] "
          >
            <option className="bg-red-100 text-red-700">Stop</option>
            <option>Running</option>
          </select>
        </div>

        {/* Order Slicing */}
        {/* <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Order Slicing
          </label>
          <input
            type="text"
            name="orderSlicing"
            value={formData.orderSlicing}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 border-[#F1F1F4] text-[#99A1B7]"
            placeholder="20"

          />
        </div> */}

        {/* Days Head */}
        {/* <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Days Head
          </label>
          <input
            type="text"
            name="daysHead"
            value={formData.daysHead}
            onChange={handleChange}
            className="mt-2 block w-full h-[50px] border-2 rounded-md px-3 text-[#99A1B7] border-[#F1F1F4]"
            placeholder="0"

          />
        </div> */}

        {/* Trail */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-[#252F4A]">
            Trail
          </label>
          <input
            type="checkbox"
            name="trail"
            checked={formData.trail}
            onChange={handleChange}
            className="mt-2 block w-[50px] h-[50px] border-2 rounded-md px-3 border-[#F1F1F4]"
          
          />

        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="px-10 h-[50px] py-2 bg-[#FF5733] text-white rounded hover:bg-red-600"
        >
          Add Order
        </button>
      </div>
    </form>
  );
};

export default AlgoAutoForm;
