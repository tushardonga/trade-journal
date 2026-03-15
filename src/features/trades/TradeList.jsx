import { useEffect, useState, useContext } from "react";
import { supabase } from "../../lib/supabase";
import { DateContext } from "../../context/DateContext";
import { Trash2, Edit3, TrendingUp, TrendingDown } from "lucide-react";

export default function TradeList({ onEdit, onDelete }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dateRange } = useContext(DateContext);

  useEffect(() => {
    fetchTrades();
  }, [dateRange]); // Refetch when global date changes

  async function fetchTrades() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .gte("entry_timestamp", dateRange.from.toISOString())
      .lte("entry_timestamp", dateRange.to.toISOString())
      .order("entry_timestamp", { ascending: false });

    if (!error) setTrades(data);
    setLoading(false);
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trade? This cannot be undone.",
    );
    if (!confirmed) return;

    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      onDelete(); // Refresh parent
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">Loading trades...</div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden my-8">
      <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">Recent Trades</h3>
        <span className="text-sm text-slate-500">
          {trades.length} trades found
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Symbol</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Entry Price</th>
              <th className="px-6 py-3">Exit Price</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">P&L</th>
              <th className="px-6 py-3">ROC %</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  {trade.pnl_amount >= 0 ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <TrendingUp size={14} /> Win
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <TrendingDown size={14} /> Loss
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                <td className="px-6 py-4 capitalize text-slate-500">
                  {trade.trade_type}
                </td>
                <td className="px-6 py-4">{trade.entry_price}</td>
                <td className="px-6 py-4">{trade.exit_price}</td>
                <td className="px-6 py-4">{trade.quantity}</td>
                <td
                  className={`px-6 py-4 font-bold ${trade.pnl_amount >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {trade.pnl_amount >= 0 ? "+" : ""}
                  {trade.pnl_amount.toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 font-medium ${trade.roc_percentage >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {trade.roc_percentage.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    className="text-slate-400 hover:text-blue-600"
                    onClick={() => onEdit(trade)}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
