import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';

export default function MonthlyBreakup() {
  const [reportData, setReportData] = useState({});
  const [years, setYears] = useState([]);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    fetchYearlyData();
  }, []);

  async function fetchYearlyData() {
    const { data, error } = await supabase
      .from('trades')
      .select('entry_timestamp, pnl_amount');

    if (error || !data) return;

    const grid = {};
    const uniqueYears = new Set();

    data.forEach((trade) => {
      const date = parseISO(trade.entry_timestamp);
      const year = format(date, 'yyyy');
      const month = format(date, 'MMM');

      uniqueYears.add(year);

      if (!grid[year]) grid[year] = {};
      grid[year][month] = (grid[year][month] || 0) + trade.pnl_amount;
    });

    setReportData(grid);
    setYears(Array.from(uniqueYears).sort((a, b) => b - a));
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-bold text-slate-700">Monthly Performance Breakup</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
              <th className="px-4 py-3 text-left">Year</th>
              {months.map(m => <th key={m} className="px-2 py-3">{m}</th>)}
              <th className="px-4 py-3 bg-slate-100 font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {years.map(year => {
              let yearTotal = 0;
              return (
                <tr key={year} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-bold text-left text-slate-700">{year}</td>
                  {months.map(month => {
                    const pnl = reportData[year]?.[month] || 0;
                    yearTotal += pnl;
                    return (
                      <td key={month} className={`px-2 py-4 font-medium ${
                        pnl > 0 ? 'text-green-600' : pnl < 0 ? 'text-red-600' : 'text-slate-300'
                      }`}>
                        {pnl !== 0 ? `${(pnl / 1000).toFixed(1)}k` : '-'}
                      </td>
                    );
                  })}
                  <td className={`px-4 py-4 font-bold bg-slate-50 ${
                    yearTotal >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {(yearTotal / 1000).toFixed(1)}k
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}