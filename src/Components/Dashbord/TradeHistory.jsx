import React, { useMemo, useState } from 'react';
import TradesTable from './TradeTable';
import { postData } from '../../api';
import { EmptyState, ErrorState, ExportButton, LoadingState } from '../../shared/components/TradingUi';

const TradeHistory = () => {
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnl, setPnl] = useState(null);
  const [startDate, setStartDate] = useState(getFormattedDate(new Date('2023-10-01')));
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));
  const [filters, setFilters] = useState({ strategy: "", symbol: "", status: "", mode: "" });
  const [visibleCount, setVisibleCount] = useState(25);

  const fetchHistory = async (start, end) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const queryString =
      start && end ? `?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}` : '';

    try {
      setError("");
      const response = await postData(`api_historicalbacktest${queryString}`, { token });
      const history = response?.data?.history || [];
      const pnlValue = response?.data?.pnl ?? null;

      setTrades(history);
      setPnl(pnlValue);
    } catch (error) {
      console.error('Error fetching trade history:', error);
      setError(error.message || "Unable to load trade history.");
      setTrades([]);
      setPnl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHistory(startDate, endDate);
  };

  const columns = trades.length > 0 ? Object.keys(trades[0]) : [];
  const filteredRows = useMemo(() => {
    return trades.filter((trade) => {
      const haystack = (key) => String(trade[key] ?? "").toLowerCase();
      const modeValue = trade.live ? "live" : "paper";
      return (
        (!filters.strategy || haystack("strategy").includes(filters.strategy.toLowerCase()) || haystack("botname").includes(filters.strategy.toLowerCase())) &&
        (!filters.symbol || haystack("symbol").includes(filters.symbol.toLowerCase()) || haystack("optionname").includes(filters.symbol.toLowerCase())) &&
        (!filters.status || haystack("status").includes(filters.status.toLowerCase()) || haystack("order_status").includes(filters.status.toLowerCase())) &&
        (!filters.mode || modeValue === filters.mode)
      );
    });
  }, [trades, filters]);

  const visibleRows = filteredRows.slice(0, visibleCount);

  const exportCsv = () => {
    if (!visibleRows.length) return;
    const csv = [
      columns.join(","),
      ...visibleRows.map((row) => columns.map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trade-history-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPnlStyle = (value) => {
    if (value === null) return '';
    return value < 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="uppercase mx-auto px-6 max-lg:px-3 py-4">
      <div className="flex flex-col justify-between mb-4 gap-3 max-lg:mt-14">
        <p className="text-2xl font-bold max-md:text-[18px] whitespace-nowrap">Trades History</p>

        {/* Filter section without scroll on mobile */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Strategy</p>
            <input value={filters.strategy} onChange={(e) => setFilters((prev) => ({ ...prev, strategy: e.target.value }))} className="border rounded px-2 py-1 text-sm" placeholder="Strategy or bot" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Symbol</p>
            <input value={filters.symbol} onChange={(e) => setFilters((prev) => ({ ...prev, symbol: e.target.value }))} className="border rounded px-2 py-1 text-sm" placeholder="Symbol" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Status</p>
            <input value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="border rounded px-2 py-1 text-sm" placeholder="Filled / rejected" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">Paper / Live</p>
            <select value={filters.mode} onChange={(e) => setFilters((prev) => ({ ...prev, mode: e.target.value }))} className="border rounded px-2 py-1 text-sm">
              <option value="">All</option>
              <option value="paper">Paper</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="bg-[#FF5733] text-white py-2 px-4 rounded-md font-semibold hover:bg-orange-600 transition duration-300 text-sm w-fit"
            >
              Search
            </button>
            <ExportButton onClick={exportCsv} disabled={!visibleRows.length} />
          </div>
        </div>
        <p className="text-xs normal-case text-[#4B5675]">
          CSV export uses currently loaded rows. No dedicated backend export endpoint is exposed in this UI.
        </p>
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
          <LoadingState label="Loading trade history..." />
        ) : error ? (
          <ErrorState message={error} onRetry={handleSearch} />
        ) : filteredRows.length === 0 ? (
          <EmptyState title="No trades found" description="Adjust the date range or filters. Trades appear here after strategy execution creates order history." />
        ) : (
          <>
            <TradesTable data={visibleRows} columns={columns} />
            {visibleRows.length < filteredRows.length ? (
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setVisibleCount((count) => count + 25)} className="rounded-md border border-[#FF5733] px-4 py-2 text-sm font-bold text-[#FF5733]">
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
