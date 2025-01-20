import React, { useState } from 'react';
import { IndianRupee, Send } from 'lucide-react';

interface AmountInputProps {
  onSubmit: (amount: number) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onSubmit(parsedAmount);
    } else {
      alert('Please enter a valid amount');
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <IndianRupee className="w-6 h-6 text-indigo-400" />
        <h1 className="text-2xl font-bold text-white">Enter Amount</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (INR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ₹
            </span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter amount"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <span>Submit Payment</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AmountInput;
