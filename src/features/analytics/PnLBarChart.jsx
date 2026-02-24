import { useEffect, useState, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { DateContext } from '../../context/DateContext';
import { format, parseISO } from 'date-fns';

export default function PnLBarChart() {
  const { dateRange } = useContext(DateContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDailyPnL();
  }, [dateRange]);

  async function fetchDailyPnL() {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('entry_timestamp, pnl_amount')
      .gte('entry_timestamp', dateRange.from.toISOString())
      .lte('entry_timestamp', dateRange.to.toISOString());

    if (error || !trades) return;

    // Grouping trades by date and summing P&L
    const dailyMap = trades.reduce((acc, trade) => {
      const day = format(parseISO(trade.entry_timestamp), 'MMM dd');
      acc[day] = (acc[day] || 0) + trade.pnl_amount;
      return acc;
    }, {});

    // Formatting for Recharts
    const formattedData = Object.keys(dailyMap).map(day => ({
      date: day,
      amount: dailyMap[day]
    }));

    setChartData(formattedData);
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="text-lg font-bold text-slate-700 mb-6">Daily Profit & Loss</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Bar dataKey="amount">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}