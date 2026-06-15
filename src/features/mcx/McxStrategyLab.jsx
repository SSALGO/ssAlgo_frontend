import React, { useEffect, useMemo, useState } from "react";
import { fetchFastApiGetData } from "../../api";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "../../shared/components/TradingUi";
import { mcxFallbackCatalog } from "./mcxFallbackCatalog";

const asArray = (value) => (Array.isArray(value) ? value : []);

const ScorePill = ({ label, value }) => (
  <div className="rounded-full border border-[#FF5733]/20 bg-[#fff4ef] px-3 py-1 text-xs font-bold text-[#B83218]">
    {label}: {value}
  </div>
);

const SectionCard = ({ title, children, className = "" }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <h2 className="mb-4 text-xl font-extrabold uppercase text-[#06133D]">{title}</h2>
    {children}
  </section>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2 text-sm text-slate-700">
    {asArray(items).map((item, index) => (
      <li key={`${item}-${index}`} className="flex gap-2">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5733]" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const McxStrategyLab = () => {
  const [catalog, setCatalog] = useState(null);
  const [catalogNotice, setCatalogNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCatalog = async () => {
    setLoading(true);
    setError("");
    setCatalogNotice("");
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetchFastApiGetData("api/mcx/strategies", {}, token);
      const data = response?.data || {};
      setCatalog(data);
      setSelectedId(data?.top_3?.[0]?.id || data?.strategies?.[0]?.id || "");
    } catch (err) {
      const message = err.message || "Unable to load MCX strategy catalog.";
      if (/not found/i.test(message)) {
        setCatalog(mcxFallbackCatalog);
        setSelectedId(mcxFallbackCatalog.top_3?.[0]?.id || mcxFallbackCatalog.strategies?.[0]?.id || "");
        setCatalogNotice("Backend endpoint /api/mcx/strategies is not available on this server yet, so this page is showing the bundled MCX catalog.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const strategies = useMemo(() => asArray(catalog?.strategies), [catalog]);
  const selectedStrategy = strategies.find((strategy) => strategy.id === selectedId) || strategies[0];

  if (loading) {
    return <div className="p-6"><LoadingState label="Loading MCX Strategy Lab" /></div>;
  }

  if (error) {
    return <div className="p-6"><ErrorState message={error} onRetry={fetchCatalog} /></div>;
  }

  if (!catalog) {
    return <div className="p-6"><EmptyState title="No MCX strategy catalog" description="The backend did not return strategy research data." /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-[#06133D]">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#450303] via-[#B83218] to-[#FF5733] p-6 text-white shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white/80">{catalog.product_category}</p>
            <h1 className="mt-2 text-3xl font-black uppercase">{catalog.product_name}</h1>
            <p className="mt-3 max-w-4xl text-base text-white/90">{catalog.one_line_pitch}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value="Research Ready" tone="ready" />
            <StatusBadge value="Paper Test First" tone="warning" />
          </div>
        </div>
      </div>

      {catalogNotice ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {catalogNotice}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {asArray(catalog.commodities).map((commodity) => (
          <div key={commodity.symbol} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-extrabold">{commodity.symbol}</h3>
            <p className="text-sm font-semibold text-slate-500">{commodity.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {asArray(commodity.traits).map((trait) => (
                <span key={trait} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{trait}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-5 xl:grid-cols-3">
        {asArray(catalog.top_3).map((strategy) => (
          <button
            key={strategy.id}
            type="button"
            onClick={() => setSelectedId(strategy.id)}
            className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              selectedId === strategy.id ? "border-[#FF5733] ring-2 ring-[#FF5733]/20" : "border-slate-200"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-[#FF5733] px-3 py-1 text-xs font-black text-white">Rank #{strategy.rank}</span>
              <span className="text-xs font-bold uppercase text-slate-500">{strategy.timeframe}</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#06133D]">{strategy.strategy_name}</h3>
            <p className="mt-3 line-clamp-4 text-sm text-slate-600">{strategy.market_logic}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {asArray(strategy.suitable_commodities).slice(0, 4).map((symbol) => (
                <span key={symbol} className="rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">{symbol}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <SectionCard title="Strategy Ranking">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Rank</th>
                  <th>Strategy</th>
                  <th>Best For</th>
                  <th>R:R</th>
                  <th>Win Rate</th>
                  <th>MCX Fit</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((strategy) => (
                  <tr key={strategy.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-black">#{strategy.rank}</td>
                    <td>
                      <button type="button" onClick={() => setSelectedId(strategy.id)} className="font-bold text-[#FF5733]">
                        {strategy.strategy_name}
                      </button>
                    </td>
                    <td>{asArray(strategy.suitable_commodities).join(", ")}</td>
                    <td>{strategy.risk_reward_ratio}</td>
                    <td>{strategy.expected_win_rate_range}</td>
                    <td>{strategy.scores?.mcx_fit ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {selectedStrategy ? (
          <SectionCard title={selectedStrategy.strategy_name}>
            <p className="mb-4 text-sm leading-6 text-slate-700">{selectedStrategy.market_logic}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(selectedStrategy.scores || {}).map(([key, value]) => (
                <ScorePill key={key} label={key.replace("_", " ")} value={value} />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 font-extrabold uppercase">Entry Conditions</h3>
                <BulletList items={selectedStrategy.entry_conditions} />
              </div>
              <div>
                <h3 className="mb-2 font-extrabold uppercase">Exit Conditions</h3>
                <BulletList items={selectedStrategy.exit_conditions} />
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-2 font-extrabold uppercase">Stop Loss</h3>
                <p className="text-sm text-slate-700">{selectedStrategy.stop_loss_logic}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-2 font-extrabold uppercase">Target Logic</h3>
                <p className="text-sm text-slate-700">{selectedStrategy.target_logic}</p>
              </div>
            </div>
          </SectionCard>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Complete Trading Rules">
          <BulletList items={catalog.complete_trading_rules} />
        </SectionCard>
        <SectionCard title="Risk Framework">
          <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            {Object.entries(catalog.risk_management_framework || {}).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-slate-50 p-3">
                <p className="font-extrabold uppercase text-[#06133D]">{key.replaceAll("_", " ")}</p>
                {Array.isArray(value) ? <BulletList items={value} /> : <p className="mt-1">{value}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SectionCard title="State Machine">
          <div className="space-y-3">
            {asArray(catalog.state_machine).map((state) => (
              <div key={state.state} className="rounded-lg border border-slate-100 p-3">
                <p className="font-black text-[#FF5733]">{state.state}</p>
                <p className="text-sm text-slate-600">{state.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Pseudocode">
          <ol className="space-y-2 text-sm text-slate-700">
            {asArray(catalog.pseudocode).map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-black text-[#FF5733]">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="API Execution Flow">
          <BulletList items={catalog.api_execution_flow} />
        </SectionCard>
      </div>

      <SectionCard title="Database Schema Requirements" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {asArray(catalog.database_schema_requirements).map((table) => (
            <div key={table.table} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-black text-[#06133D]">{table.table}</h3>
              <p className="mt-1 text-sm text-slate-600">{table.purpose}</p>
              <p className="mt-3 text-xs font-bold uppercase text-slate-500">Key fields</p>
              <p className="mt-1 text-sm text-slate-700">{asArray(table.key_fields).join(", ")}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        {catalog.disclaimer}
      </p>
    </main>
  );
};

export default McxStrategyLab;
