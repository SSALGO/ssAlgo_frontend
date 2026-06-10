


import React, { useMemo, useState, useEffect } from 'react';
import TradesTable from './TradeTable';
import { fetchGetData } from '../../api/index';
import { EmptyState, ErrorState, ExportButton, LoadingState } from '../../shared/components/TradingUi';

const MainTradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const [filterDate, setFilterDate] = useState(getFormattedDate(new Date()));
const [filters, setFilters] = useState({ strategy: '', symbol: '', status: '', mode: '' });
  
  async function fetchMainHistory(date) {
    const queryString = date ? `?date=${date}` : '';
    setLoading(true);
    setError('');
    try {
      const response = await fetchGetData(`api_mainhistoricalbacktest${queryString}`);
      const history = Array.isArray(response?.data?.history) ? response.data.history : [];
      setTrades(history);
    } catch (fetchError) {
      console.error('Error fetching main trade history:', fetchError);
      setTrades([]);
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

  const filteredRows = useMemo(() => trades.filter((trade) => {
    const read = (key) => String(trade[key] ?? '').toLowerCase();
    const mode = trade.live ? 'live' : 'paper';
    return (
      (!filters.strategy || read('strategy').includes(filters.strategy.toLowerCase()) || read('botname').includes(filters.strategy.toLowerCase())) &&
      (!filters.symbol || read('symbol').includes(filters.symbol.toLowerCase()) || read('optionname').includes(filters.symbol.toLowerCase())) &&
      (!filters.status || read('status').includes(filters.status.toLowerCase()) || read('order_status').includes(filters.status.toLowerCase())) &&
      (!filters.mode || mode === filters.mode)
    );
  }), [trades, filters]);

  const exportCsv = () => {
    if (!filteredRows.length) return;
    const csv = [
      columns.join(','),
      ...filteredRows.map((row) => columns.map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `main-trade-history-${filterDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="uppercase mx-auto px-6 max-lg:px-3 py-4">
      <div className="flex justify-between flex-col mb-4 gap-3  max-lg:mt-14">
        <p className="text-2xl font-bold max-md:text-[18px] text-nowrap">Main Trades History</p>
     
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <p className="text-sm font-semibold">Filter by Date</p>
            <input type="date" value={filterDate} onChange={handleFilterChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <p className="text-sm font-semibold">Strategy</p>
            <input value={filters.strategy} onChange={(e) => setFilters((prev) => ({ ...prev, strategy: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="Strategy" />
          </div>
          <div>
            <p className="text-sm font-semibold">Symbol</p>
            <input value={filters.symbol} onChange={(e) => setFilters((prev) => ({ ...prev, symbol: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="Symbol" />
          </div>
          <div>
            <p className="text-sm font-semibold">Status</p>
            <input value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="w-full border rounded px-2 py-1" placeholder="Status" />
          </div>
          <div>
            <p className="text-sm font-semibold">Paper / Live</p>
            <select value={filters.mode} onChange={(e) => setFilters((prev) => ({ ...prev, mode: e.target.value }))} className="w-full border rounded px-2 py-1">
              <option value="">All</option>
              <option value="paper">Paper</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div className="flex items-end">
            <ExportButton onClick={exportCsv} disabled={!filteredRows.length} />
          </div>
        </div>
        <p className="text-xs normal-case text-[#4B5675]">CSV export uses currently loaded rows. No dedicated backend export endpoint is exposed in this UI.</p>
      </div>
      <div className='w-full'>
  {loading ? (
    <LoadingState label="Loading main trade history..." />
  ) : error ? (
    <ErrorState message={error} onRetry={() => fetchMainHistory(filterDate)} />
  ) : filteredRows.length === 0 ? (
    <EmptyState title="No trades found" description="Adjust the date or filters to find matching trades." />
  ) : (
    <TradesTable data={filteredRows} columns={columns} />
  )}
</div>
    </div>
      
     

  );
};

export default MainTradeHistory;


