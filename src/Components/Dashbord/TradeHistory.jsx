import React, { useState } from 'react';
import TradesTable from './TradeTable';
import { postData } from '../../api';

const TradeHistory = () => {
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pnl, setPnl] = useState(null);
  const [startDate, setStartDate] = useState(getFormattedDate(new Date('2023-10-01')));
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));

  const fetchHistory = async (start, end) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const queryString =
      start && end ? `?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}` : '';

    try {
      const response = await postData(`api_historicalbacktest${queryString}`, { token });
      const history = response?.data?.history || [];
      const pnlValue = response?.data?.pnl ?? null;

      setTrades(history);
      setFilteredTrades(history);
      setPnl(pnlValue);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      setTrades([]);
      setFilteredTrades([]);
      setPnl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHistory(startDate, endDate);
  };

  const columns = trades.length > 0 ? Object.keys(trades[0]) : [];

  const getPnlStyle = (value) => {
    if (value === null) return '';
    return value < 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="uppercase mx-auto px-6 max-lg:px-3 py-4">
      <div className="flex flex-col justify-between mb-4 gap-3 max-lg:mt-14">
        <p className="text-2xl font-bold max-md:text-[18px] whitespace-nowrap">Trades History</p>

        {/* Filter section without scroll on mobile */}
        <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-2">
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">End Date</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
            />
          </div>
          <div className="flex md:items-end">
            <button
              onClick={handleSearch}
              className="bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 text-sm w-fit"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* PNL Summary */}
      {pnl !== null && (
        <div className="text-xl font-bold mb-2 text-center">
          <span className="text-black">Total PNL: </span>
          <span className={getPnlStyle(pnl)}>₹{pnl.toLocaleString()}</span>
        </div>
      )}

      {/* Table or loading state */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl font-semibold text-gray-600">Loading...</p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <h1 className="text-2xl font-bold text-[#FF5733]">No Trades found</h1>
          </div>
        ) : (
          <TradesTable data={filteredTrades} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
