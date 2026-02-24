import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { DateContext } from '../../context/DateContext';
import { format, subYears, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

export default function TradeHeatmap() {
  const { dateRange } = useContext(DateContext);
  const [data, setData] = useState({});
  
  // We'll show the last 6 months for the heatmap
  const endDate = new Date();
  const startDate = subYears(endDate, 0.5); // 6 months ago

  useEffect(() => {
    fetchHeatmapData();
  }, [dateRange]);

  async function fetchHeatmapData() {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('entry_timestamp, pnl_amount')
      .gte('entry_timestamp', startDate.toISOString())
      .lte('entry_timestamp', endDate.toISOString());

    if (error) return;

    // Group P&L by date
    const dailyPnl = trades.reduce((acc, trade) => {
      const dateKey = format(parseISO(trade.entry_timestamp), 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + trade.pnl_amount;
      return acc;
    }, {});

    setData(dailyPnl);
  }

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getColor = (amount) => {
    if (!amount) return 'bg-slate-100'; // No trades
    if (amount > 0) {
      if (amount > 5000) return 'bg-green-700'; // Big Win
      if (amount > 1000) return 'bg-green-500';
      return 'bg-green-200'; // Small Win
    } else {
      if (amount < -5000) return 'bg-red-700'; // Big Loss
      if (amount < -1000) return 'bg-red-500';
      return 'bg-red-200'; // Small Loss
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 overflow-x-auto">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Trading Activity (Last 6 Months)</h3>
      <div className="flex gap-1 flex-wrap w-[800px]">
        {allDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const pnl = data[dateKey];
          return (
            <div
              key={dateKey}
              title={`${dateKey}: ${pnl || 0}`}
              className={`w-3 h-3 rounded-sm ${getColor(pnl)} cursor-help transition-colors hover:ring-1 hover:ring-slate-400`}
            />
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Profit</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Loss</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 rounded-sm"></div> No Trade</div>
      </div>
    </div>
  );
}