import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { DateContext } from '../../context/DateContext';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function TopTrades() {
  const { dateRange } = useContext(DateContext);
  const [topWinners, setTopWinners] = useState([]);
  const [topLosers, setTopLosers] = useState([]);

  useEffect(() => {
    fetchTopTrades();
  }, [dateRange]);

  async function fetchTopTrades() {
    // Fetch all trades in range
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .gte('entry_timestamp', dateRange.from.toISOString())
      .lte('entry_timestamp', dateRange.to.toISOString());

    if (error || !data) return;

    // Sort by PnL Amount
    const sorted = [...data].sort((a, b) => b.pnl_amount - a.pnl_amount);
    
    setTopWinners(sorted.slice(0, 3).filter(t => t.pnl_amount > 0));
    setTopLosers(sorted.slice(-3).reverse().filter(t => t.pnl_amount < 0));
  }

  const TradeSmallCard = ({ trade, isWinner }) => (
    <div className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-slate-50 transition">
      <div>
        <p className="font-bold text-slate-800 uppercase">{trade.symbol}</p>
        <p className="text-xs text-slate-500">{new Date(trade.entry_timestamp).toLocaleDateString()}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
          {isWinner ? '+' : ''}{trade.pnl_amount.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400">{trade.roc_percentage.toFixed(2)}%</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Top Winners */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-green-50 px-4 py-3 border-b flex items-center gap-2">
          <ArrowUpCircle className="text-green-600" size={20} />
          <h3 className="font-bold text-green-800">Top 3 Winners</h3>
        </div>
        <div>
          {topWinners.length > 0 ? topWinners.map(t => <TradeSmallCard key={t.id} trade={t} isWinner={true} />) : <p className="p-4 text-sm text-slate-400">No winning trades</p>}
        </div>
      </div>

      {/* Top Losers */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-red-50 px-4 py-3 border-b flex items-center gap-2">
          <ArrowDownCircle className="text-red-600" size={20} />
          <h3 className="font-bold text-red-800">Top 3 Losers</h3>
        </div>
        <div>
          {topLosers.length > 0 ? topLosers.map(t => <TradeSmallCard key={t.id} trade={t} isWinner={false} />) : <p className="p-4 text-sm text-slate-400">No losing trades</p>}
        </div>
      </div>
    </div>
  );
}