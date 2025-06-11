
import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import { UserContext } from '../contexts/UserContext';
import { UsersIcon, ClipboardIcon, TELEGRAM_BOT_USERNAME } from '../constants'; // Import TELEGRAM_BOT_USERNAME

const ReferralPage: React.FC = () => {
  const context = useContext(UserContext);
  const [copied, setCopied] = useState(false);

  if (!context) return <div>Loading...</div>;
  const { user } = context;

  // Construct the Telegram referral link
  // The user.referralCode should already be in the format "TG<USER_ID>"
  const referralLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${user.referralCode}`;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy. Please manually copy the code/link.');
    });
  };

  return (
    <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="bg-[#2D1A4B] p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <UsersIcon className="w-20 h-20 text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Refer & Earn</h2>
        <p className="text-gray-300 mb-6">
          Invite your friends to join and earn exciting rewards for every successful referral!
        </p>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">Your Unique Referral Code:</p>
          <div className="flex items-center justify-center bg-gray-700 p-3 rounded-lg">
            <p className="text-xl font-mono text-yellow-300 mr-4">{user.referralCode}</p>
            <button onClick={() => handleCopy(user.referralCode)} title="Copy Code" className="p-2 rounded-md hover:bg-purple-600 transition-colors">
              <ClipboardIcon className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-1">Share Your Referral Link:</p>
           <div className="flex items-center justify-center bg-gray-700 p-3 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-300 mr-2 truncate">{referralLink}</p>
            <button onClick={() => handleCopy(referralLink)} title="Copy Link" className="p-2 rounded-md hover:bg-purple-600 transition-colors">
              <ClipboardIcon className="w-5 h-5 text-gray-300" />
            </button>
          </div>
          {/* 
            The check for "YOUR_BOT_USERNAME_HERE" has been removed.
            The developer is responsible for setting TELEGRAM_BOT_USERNAME in constants.tsx.
            A comment in constants.tsx serves as the primary reminder.
          */}
        </div>

        {copied && <p className="text-green-400 mb-4">Copied to clipboard!</p>}

        <Button 
          variant="gradient" 
          className="w-full py-3 text-lg" 
          onClick={() => {
            // The check for "YOUR_BOT_USERNAME_HERE" has been removed.
            // It's assumed TELEGRAM_BOT_USERNAME is correctly set in constants.tsx.
            const shareText = `Join and earn! Use my referral code: ${user.referralCode} or click the link: ${referralLink}`;
            if (navigator.share) {
              navigator.share({
                title: 'Refer & Earn',
                text: shareText,
                url: referralLink,
              }).catch(console.error);
            } else {
              // Fallback for browsers that don't support navigator.share
              handleCopy(referralLink); // Copy the link
              alert('Referral link copied! Share it with your friends.');
            }
          }}
        >
          Share Now
        </Button>

        <div className="mt-8 text-sm text-gray-400 space-y-2">
          <p><strong>Referral Bonus:</strong> Earn 100 units for each friend who signs up using your code.</p>
          <p>The more friends you invite, the more you earn!</p>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
