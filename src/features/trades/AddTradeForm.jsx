import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddTradeForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        symbol: '',
        trade_type: 'long',
        asset_type: 'equity',
        entry_price: '',
        exit_price: '',
        quantity: '',
        entry_timestamp: '',
        exit_timestamp: '',
        entry_reason: '',
        exit_reason: '',
        mistakes_lessons: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Create a "Clean" copy of the data
        const cleanedData = {
            ...formData,
            // Convert strings to Numbers using parseFloat or Number
            // If the field is empty, we use 0 or null to avoid the "" error
            entry_price: parseFloat(formData.entry_price) || 0,
            exit_price: parseFloat(formData.exit_price) || 0,
            quantity: parseFloat(formData.quantity) || 0,
            // Ensure dates are not empty strings
            entry_timestamp: formData.entry_timestamp || new Date().toISOString(),
            exit_timestamp: formData.exit_timestamp || new Date().toISOString(),
        };

        const { error } = await supabase
            .from('trades')
            .insert([cleanedData]); // Send the CLEANED data, not the raw formData

        if (error) {
            console.error("Supabase Error:", error);
            alert(`Error: ${error.message}`);
        } else {
            alert("Trade added successfully!");
            // Optional: Clear form here
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border space-y-4">
            <h2 className="text-2xl font-bold mb-6">Log New Trade</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Trade Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Side</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="trade_type" value="long" checked={formData.trade_type === 'long'} onChange={handleChange} /> Long
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="trade_type" value="short" checked={formData.trade_type === 'short'} onChange={handleChange} /> Short
                        </label>
                    </div>
                </div>

                {/* Asset Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Asset</label>
                    <select name="asset_type" onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="equity">Equity</option>
                        <option value="option">Option</option>
                    </select>
                </div>

                {/* Symbol */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol</label>
                    <input name="symbol" placeholder="e.g. RELIANCE" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <input type="number" name="quantity" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>

                {/* Entry Price */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Entry Price</label>
                    <input type="number" step="0.01" name="entry_price" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>

                {/* Exit Price */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Exit Price</label>
                    <input type="number" step="0.01" name="exit_price" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>

                {/* Entry Date/Time */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Entry Date & Time</label>
                    <input type="datetime-local" name="entry_timestamp" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>

                {/* Exit Date/Time */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Exit Date & Time</label>
                    <input type="datetime-local" name="exit_timestamp" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
                {loading ? 'Saving...' : 'Save Trade'}
            </button>
        </form>
    );
}