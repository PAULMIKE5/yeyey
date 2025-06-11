
import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import { UserContext, WithdrawalRequest } from '../contexts/UserContext';
import { BanknotesIconSolid } from '../constants';

const WithdrawalPage: React.FC = () => {
  const context = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddressState] = useState('');
  const [method, setMethod] = useState('paypal');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!context) return <div>Loading...</div>;
  const { user, submitWithdrawalRequest, withdrawalRequests } = context;

  const currentUserWithdrawals = withdrawalRequests.filter(
    (req) => req.userId === user.userId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent first

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    // Insufficient balance check is now primarily handled by submitWithdrawalRequest
    // but a client-side check can provide faster feedback.
    if (withdrawAmount > user.earnings) {
        setError("Insufficient balance."); // This will be caught by submitWithdrawalRequest too
        return;
    }
    if (!walletAddress.trim()) {
      setError("Please enter your wallet address.");
      return;
    }

    const success = submitWithdrawalRequest({
      amount: withdrawAmount,
      walletAddress: walletAddress.trim(),
      method,
    });

    if (success) {
      setMessage(`Withdrawal request for $${withdrawAmount.toLocaleString()} submitted. Amount deducted and pending review.`);
      setAmount('');
      setWalletAddressState('');
    } else {
      // Error message for insufficient funds is handled by an alert in submitWithdrawalRequest.
      // Set a generic error if not already handled by alert (though unlikely with current logic).
      if (!error && user.earnings < withdrawAmount) { // Check if no specific error was set before
         setError("Failed to submit withdrawal request. Please check your balance.");
      } else if (!error) {
         setError("Failed to submit withdrawal request. Please try again.");
      }
    }
    
    setTimeout(() => {
        setMessage(null);
        setError(null);
    }, 7000); // Increased timeout for message visibility
  };

  return (
    <div className="p-4 md:p-6 space-y-8 min-h-[calc(100vh-4rem)]"> {/* Adjusted padding and min-height */}
      <div className="bg-[#2D1A4B] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-center mb-6">
          <BanknotesIconSolid className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mr-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Earnings</h2>
        </div>

        <p className="text-center text-gray-300 mb-1 sm:mb-2">Current Balance:</p>
        <p className="text-center text-3xl sm:text-4xl font-bold text-green-400 mb-6 sm:mb-8">
          ${(user.earnings || 0).toLocaleString()}
        </p>

        <form onSubmit={handleWithdraw} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Withdraw</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
              required
              aria-describedby="amount-error"
            />
          </div>

          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-1">Your Wallet Address</label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddressState(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
              required
              aria-describedby="wallet-error"
            />
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-300 mb-1">Withdrawal Method</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto_usdt">Crypto (USDT)</option>
            </select>
          </div>

          <Button type="submit" variant="gradient" className="w-full py-3 text-lg">
            Request Withdrawal
          </Button>
        </form>

        {message && (
          <p id="success-message" role="alert" className="mt-4 sm:mt-6 text-center text-md sm:text-lg text-green-400">{message}</p>
        )}
        {error && (
          <p id="error-message" role="alert" className="mt-4 sm:mt-6 text-center text-md sm:text-lg text-red-400">{error}</p>
        )}
      </div>

      {/* Withdrawal History Section */}
      <div className="mt-8 bg-[#2D1A4B] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center">Withdrawal History</h3>
        {currentUserWithdrawals.length === 0 ? (
          <p className="text-center text-gray-400">You have no withdrawal history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-3 py-3">Date</th>
                  <th scope="col" className="px-3 py-3">Amount</th>
                  <th scope="col" className="px-3 py-3">Wallet</th>
                  <th scope="col" className="px-3 py-3">Method</th>
                  <th scope="col" className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentUserWithdrawals.map((req) => (
                  <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-600/30">
                    <td className="px-3 py-3">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3">${req.amount.toLocaleString()}</td>
                    <td className="px-3 py-3 truncate max-w-[100px] sm:max-w-[150px]" title={req.walletAddress}>{req.walletAddress}</td>
                    <td className="px-3 py-3">{req.method}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'approved' ? 'bg-green-500 text-white' :
                        req.status === 'declined' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black' // pending
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalPage;