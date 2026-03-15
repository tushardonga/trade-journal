import { useEffect, useState } from "react";
import Select from "react-select";
import { supabase } from "../../lib/supabase";

export default function AddTradeForm({ editingTrade, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [stockOptions, setStockOptions] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [selectKey, setSelectKey] = useState(0);

  // Sync form with editingTrade prop
  useEffect(() => {
    if (editingTrade) {
      // Format timestamps for datetime-local input (YYYY-MM-DDTHH:MM)
      const entry = editingTrade.entry_timestamp
        ? new Date(editingTrade.entry_timestamp).toISOString().slice(0, 16)
        : "";
      const exit = editingTrade.exit_timestamp
        ? new Date(editingTrade.exit_timestamp).toISOString().slice(0, 16)
        : "";

      setFormData({
        ...editingTrade,
        entry_timestamp: entry,
        exit_timestamp: exit,
      });
      setSelectKey((prev) => prev + 1); // Reset dropdown to show correct symbol
    } else {
      setFormData(initialState);
      setSelectKey((prev) => prev + 1);
    }
  }, [editingTrade]);

  useEffect(() => {
    async function getStocks() {
      const { data, error } = await supabase
        .from("stocks")
        .select("symbol, company_name")
        .order("symbol", { ascending: true });

      if (data) {
        // react-select needs an array of { value, label } objects
        const options = data.map((stock) => ({
          value: stock.symbol,
          label: `${stock.symbol} (${stock.company_name || ""})`,
        }));
        setStockOptions(options);
      }
      if (error) console.error("Error fetching stocks:", error);
    }
    getStocks();
  }, []);

  const handleSelectChange = (selectedOption) => {
    setFormData({
      ...formData,
      symbol: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symbol) {
      alert("Please select a stock symbol!");
      return; // This stops the function from continuing
    }
    setLoading(true);

    // 1. Create a "Clean" copy of the data
    const dataToSend = {
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

    delete dataToSend.pnl_amount;
    delete dataToSend.roc_percentage;
    delete dataToSend.created_at;

    if (editingTrade) {
      delete dataToSend.id;
    }

    let result;
    if (editingTrade) {
      // UPDATE existing trade
      result = await supabase
        .from("trades")
        .update(dataToSend)
        .eq("id", editingTrade.id);
    } else {
      // INSERT new trade
      result = await supabase.from("trades").insert([dataToSend]);
    }

    if (result.error) {
      console.error("Supabase Error:", result.error);
      alert(`Error: ${result.error.message}`);
    } else {
      alert(editingTrade ? "Updated!" : "Saved!");
      onSuccess();
      setLoading(false);
      setFormData(initialState);
      setSelectKey((prev) => prev + 1);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-sm border space-y-4 mb-3"
    >
      <h2 className="text-2xl font-bold mb-6">
        {editingTrade ? "Edit Trade" : "Log New Trade"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Trade Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Side</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="trade_type"
                value="long"
                checked={formData.trade_type === "long"}
                onChange={handleChange}
              />{" "}
              Long
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="trade_type"
                value="short"
                checked={formData.trade_type === "short"}
                onChange={handleChange}
              />{" "}
              Short
            </label>
          </div>
        </div>

        {/* Asset Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Asset</label>
          <select
            name="asset_type"
            value={formData.asset_type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="equity">Equity</option>
            <option value="option">Option</option>
          </select>
        </div>

        {/* Symbol */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Stock Symbol (Searchable)
          </label>
          <Select
            options={stockOptions}
            value={stockOptions.find((opt) => opt.value === formData.symbol)}
            onChange={handleSelectChange}
            placeholder="Search stock..."
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                borderColor: "#e2e8f0",
                padding: "2px",
              }),
            }}
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Entry Price */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Entry Price</label>
          <input
            type="number"
            step="0.01"
            name="entry_price"
            value={formData.entry_price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Exit Price */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Exit Price</label>
          <input
            type="number"
            step="0.01"
            name="exit_price"
            value={formData.exit_price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Entry Date/Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Entry Date & Time</label>
          <input
            type="datetime-local"
            name="entry_timestamp"
            value={formData.entry_timestamp}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Exit Date/Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Exit Date & Time</label>
          <input
            type="datetime-local"
            name="exit_timestamp"
            value={formData.exit_timestamp}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
      >
        {loading
          ? "Processing..."
          : editingTrade
            ? "Update Trade"
            : "Save Trade"}
      </button>
      {editingTrade && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full px-6 py-3 border rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export const initialState = {
  symbol: "",
  trade_type: "long",
  asset_type: "equity",
  entry_price: "",
  exit_price: "",
  quantity: "",
  entry_timestamp: "",
  exit_timestamp: "",
  entry_reason: "",
  exit_reason: "",
  mistakes_lessons: "",
};
