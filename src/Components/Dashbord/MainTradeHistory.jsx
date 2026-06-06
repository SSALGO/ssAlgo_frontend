


import React, { useState, useEffect } from 'react';
import TradesTable from './TradeTable';
import { fetchGetData } from '../../api/index';

const MainTradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const [filterDate, setFilterDate] = useState(getFormattedDate(new Date()));
  
  const [showDateFilter, setShowDateFilter] = useState(false); // New state to toggle date input visibility

  async function fetchMainHistory(date) {
    const queryString = date ? `?date=${date}` : '';
    const response = await fetchGetData(`api_mainhistoricalbacktest${queryString}`);
    // console.log(response.data.history);

    setTrades(response.data.history);
    setFilteredTrades(response.data.history);
  }

  useEffect(() => {
    fetchMainHistory(filterDate); // Fetch based on filter date
  }, [filterDate]);

  const handleFilterChange = (e) => {
    setFilterDate(e.target.value);
  };

  // const columns = Object.keys(trades[0] || {});
  const columns = Object.keys(trades[0] || {}).filter(
    (col) => !['botcode', 'user', 'decision', 'optiontoken', 'symbol', 'time','live','BSmode'].includes(col)
  );


  return (
    <div className="uppercase mx-auto px-6 max-lg:px-3 py-4">
      <div className="flex justify-between flex-col mb-4 gap-3  max-lg:mt-14">
        <p className="text-2xl font-bold max-md:text-[18px] text-nowrap">Main Trades History</p>
     
        
          <p>Filter by Date</p>
      
          <input
            type="date"
            value={filterDate}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1"
          />
   
   
    
    
      
      </div>
      <div className='w-full'>
  {filteredTrades.length === 0 ? (
    <div className='flex justify-center items-center h-screen'>
      <h1 className="text-2xl font-bold text-[#FF5733]">No Trades found</h1>
    </div>
  ) : (
    <TradesTable data={filteredTrades} columns={columns} />
  )}
</div>
    </div>
      
     

  );
};

export default MainTradeHistory;


