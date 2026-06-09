


import React, { useState, useEffect } from 'react';
import TradesTable from './TradeTable';
import { fetchGetData } from '../../api/index';

const MainTradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const [filterDate, setFilterDate] = useState(getFormattedDate(new Date()));
  
  async function fetchMainHistory(date) {
    const queryString = date ? `?date=${date}` : '';
    setLoading(true);
    setError('');
    try {
      const response = await fetchGetData(`api_mainhistoricalbacktest${queryString}`);
      const history = Array.isArray(response?.data?.history) ? response.data.history : [];
      setTrades(history);
      setFilteredTrades(history);
    } catch (fetchError) {
      console.error('Error fetching main trade history:', fetchError);
      setTrades([]);
      setFilteredTrades([]);
      setError(fetchError.message || 'Unable to load main trade history.');
    } finally {
      setLoading(false);
    }
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
  {loading ? (
    <div className='flex justify-center items-center h-64'>
      <h1 className="text-xl font-semibold text-gray-600">Loading...</h1>
    </div>
  ) : error ? (
    <div className='flex flex-col gap-3 justify-center items-center h-64'>
      <h1 className="text-xl font-bold text-red-600">{error}</h1>
      <button
        type="button"
        onClick={() => fetchMainHistory(filterDate)}
        className="bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold"
      >
        Retry
      </button>
    </div>
  ) : filteredTrades.length === 0 ? (
    <div className='flex justify-center items-center h-64'>
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


