// src/App.jsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/layout/Header';
import Auth from './features/auth/Auth';
import AddTradeForm from './features/trades/AddTradeForm';
import StatsCards from './features/analytics/StatsCards';
import TradeList from './features/trades/TradeList';
import PnLBarChart from './features/analytics/PnLBarChart';
import TradeHeatmap from './features/analytics/TradeHeatmap';
import TopTrades from './features/analytics/TopTrades';
import TradeCalendar from './features/analytics/TradeCalendar';
import MonthlyBreakup from './features/analytics/MonthlyBreakup';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {/* Feature 5: Statistics Cards at the top */}
        <StatsCards />
        <TopTrades />
       
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddTradeForm />
          </div>
          <div className="lg:col-span-2">
            <TradeCalendar />
            <MonthlyBreakup />
             <TradeHeatmap />
            <PnLBarChart />
            <TradeList />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;