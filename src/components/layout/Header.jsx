import { useContext } from 'react';
import { DateContext } from '../../context/DateContext';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Header() {
    const { dateRange, setDateRange } = useContext(DateContext);

    // Simple handler to change date (You can later replace this with a fancy Shadcn Calendar)
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: new Date(value)
        }));
    };

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-slate-800">TradeJournal.io</h1>

            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <div className="flex gap-2 items-center text-sm">
                    <input
                        type="date"
                        name="from"
                        className="bg-transparent outline-none border-none"
                        onChange={handleDateChange}
                    />
                    <span className="text-slate-400">to</span>
                    <input
                        type="date"
                        name="to"
                        className="bg-transparent outline-none border-none"
                        onChange={handleDateChange}
                    />
                </div>
            </div>
            <button
                onClick={() => supabase.auth.signOut()}
                className="ml-4 text-sm text-red-500 hover:text-red-700 font-medium"
            >
                Logout
            </button>
        </header>
    );
}
