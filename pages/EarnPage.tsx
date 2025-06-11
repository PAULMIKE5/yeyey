
import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import { UserContext } from '../contexts/UserContext';
import { EyeIcon } from '../constants';

const EarnPage: React.FC = () => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adMessage, setAdMessage] = useState<string | null>(null);
  const context = useContext(UserContext);

  if (!context) return <div>Loading...</div>;
  const { addEarnings } = context;

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdMessage("Watching ad... please wait.");
    
    // Simulate ad watching
    setTimeout(() => {
      const earningsFromAd = Math.floor(Math.random() * 5) + 1; // Earn 1 to 5 units
      addEarnings(earningsFromAd);
      setAdMessage(`You earned ${earningsFromAd} units!`);
      setIsWatchingAd(false);
      setTimeout(() => setAdMessage(null), 3000); // Clear message after 3s
    }, 3000); // Simulate 3 seconds ad
  };

  return (
    <div className="p-6 space-y-6 text-center min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="bg-[#2D1A4B] p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Watch Ads & Earn</h2>
        
        <EyeIcon className="w-24 h-24 text-purple-400 mx-auto mb-6" />

        <p className="text-gray-300 mb-8">
          Watch short advertisements to earn rewards. Click the button below to start.
        </p>

        <Button 
          variant="gradient" 
          onClick={handleWatchAd} 
          disabled={isWatchingAd}
          className="w-full py-3 text-lg"
        >
          {isWatchingAd ? 'Watching...' : 'Watch Ad Now'}
        </Button>

        {adMessage && (
          <p className={`mt-6 text-lg ${adMessage.includes('earned') ? 'text-green-400' : 'text-yellow-400'}`}>
            {adMessage}
          </p>
        )}
        
        <div className="mt-8 text-sm text-gray-400">
            <p>More earning opportunities coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default EarnPage;
