import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { DateContext } from '../../context/DateContext';
import { TrendingUp, TrendingDown, Target, Activity, Award, AlertTriangle } from 'lucide-react';

export default function StatsCards() {
  const { dateRange } = useContext(DateContext);
  const [stats, setStats] = useState({
    totalPnL: 0,
    totalTrades: 0,
    biggestWin: 0,
    biggestLoss: 0,
    avgWinner: 0,
    avgLoser: 0,
    riskToReward: 0,
    avgPnL: 0
  });

  useEffect(() => {
    calculateStats();
  }, [dateRange]);

  async function calculateStats() {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('pnl_amount')
      .gte('entry_timestamp', dateRange.from.toISOString())
      .lte('entry_timestamp', dateRange.to.toISOString());

    if (error || !trades) return;

    const winners = trades.filter(t => t.pnl_amount > 0).map(t => t.pnl_amount);
    const losers = trades.filter(t => t.pnl_amount < 0).map(t => Math.abs(t.pnl_amount));

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl_amount, 0);
    const avgWinner = winners.length ? winners.reduce((a, b) => a + b, 0) / winners.length : 0;
    const avgLoser = losers.length ? losers.reduce((a, b) => a + b, 0) / losers.length : 0;

    setStats({
      totalPnL,
      totalTrades: trades.length,
      biggestWin: winners.length ? Math.max(...winners) : 0,
      biggestLoss: losers.length ? Math.max(...losers) : 0,
      avgWinner,
      avgLoser,
      riskToReward: avgLoser !== 0 ? (avgWinner / avgLoser).toFixed(2) : 0,
      avgPnL: trades.length ? totalPnL / trades.length : 0
    });
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <span className={`text-2xl font-bold ${typeof value === 'number' && value < 0 ? 'text-red-600' : 'text-slate-800'}`}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total P&L" value={stats.totalPnL} icon={Activity} color="bg-blue-50 text-blue-600" />
      <StatCard title="Total Trades" value={stats.totalTrades} icon={Target} color="bg-purple-50 text-purple-600" />
      <StatCard title="Biggest Win" value={stats.biggestWin} icon={Award} color="bg-green-50 text-green-600" />
      <StatCard title="Biggest Loss" value={-stats.biggestLoss} icon={AlertTriangle} color="bg-red-50 text-red-600" />
      <StatCard title="Avg. Winner" value={stats.avgWinner} icon={TrendingUp} color="bg-green-100 text-green-700" />
      <StatCard title="Avg. Loser" value={-stats.avgLoser} icon={TrendingDown} color="bg-red-100 text-red-700" />
      <StatCard title="Risk : Reward" value={stats.riskToReward} icon={Activity} color="bg-orange-50 text-orange-600" />
      <StatCard title="Avg. P&L / Trade" value={stats.avgPnL} icon={Activity} color="bg-slate-50 text-slate-600" />
    </div>
  );
}