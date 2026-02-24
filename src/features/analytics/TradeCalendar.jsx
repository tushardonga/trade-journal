import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { DateContext } from '../../context/DateContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from 'date-fns';

export default function TradeCalendar() {
  const { dateRange } = useContext(DateContext);
  const [dailyData, setDailyData] = useState({});
  
  // Use the 'from' date from our Global Calendar to determine which month to show
  const monthStart = startOfMonth(dateRange.from);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  useEffect(() => {
    fetchCalendarData();
  }, [dateRange]);

  async function fetchCalendarData() {
    const { data, error } = await supabase
      .from('trades')
      .select('entry_timestamp, pnl_amount')
      .gte('entry_timestamp', monthStart.toISOString())
      .lte('entry_timestamp', monthEnd.toISOString());

    if (error || !data) return;

    // Group by date: { "2026-02-24": { pnl: 500, count: 2 } }
    const grouped = data.reduce((acc, trade) => {
      const dateKey = format(parseISO(trade.entry_timestamp), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = { pnl: 0, count: 0 };
      acc[dateKey].pnl += trade.pnl_amount;
      acc[dateKey].count += 1;
      return acc;
    }, {});

    setDailyData(grouped);
  }

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 uppercase tracking-wider">
          {format(monthStart, 'MMMM yyyy')}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 border-b bg-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const stats = dailyData[dateKey];
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={dateKey} 
              className={`h-24 border-r border-b p-2 transition-colors hover:bg-slate-50 
                ${!isCurrentMonth ? 'bg-slate-50/50 opacity-30' : 'bg-white'}`}
            >
              <span className="text-xs font-medium text-slate-400">{format(day, 'd')}</span>
              
              {stats && (
                <div className="mt-1 flex flex-col items-center">
                  <span className={`text-sm font-bold ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.pnl >= 0 ? '+' : ''}{Math.round(stats.pnl / 1000)}k
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded-full">
                    {stats.count} {stats.count === 1 ? 'Trade' : 'Trades'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}