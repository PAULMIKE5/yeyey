
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { UserContext } from '../contexts/UserContext';
import { CurrencyDollarIconOutline, UsersIcon } from '../constants';


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  if (!context) {
    // This should ideally not happen if UserProvider is set up correctly in App.tsx
    return <div>Loading user data...</div>;
  }
  const { user } = context;

  const profileImageSrc = user.photoUrl ? user.photoUrl : `https://picsum.photos/seed/${user.name}/200/200`;

  return (
    <div className="p-4 space-y-6 min-h-[calc(100vh-4rem)]"> {/* 4rem is navbar height */}
      {/* Welcome Section */}
      <div className="bg-[#2D1A4B] p-6 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white">Welcome {user.name}</h1>
        <p className="text-gray-300 mt-1 mb-4 text-sm">Start Earning Money Now</p>
        <Button variant="gradient" onClick={() => navigate('/earn')} className="w-full sm:w-auto px-8 py-3 text-base">
          Earn Now
        </Button>
        <div className="mt-6 flex justify-center">
          <img 
            src={profileImageSrc}
            alt="User illustration or avatar" 
            className="rounded-full w-40 h-40 object-cover border-4 border-purple-500 shadow-lg"
            onError={(e) => { // Fallback if Telegram photo URL fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== `https://picsum.photos/seed/${user.name}/200/200`) {
                target.src = `https://picsum.photos/seed/${user.name}/200/200`;
              }
            }}
          />
        </div>
      </div>

      {/* Earnings Section */}
      <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex items-center justify-between mb-3">
          <CurrencyDollarIconOutline className="w-10 h-10 text-yellow-300" />
        </div>
        <p className="text-4xl font-bold">{user.earnings.toLocaleString()}</p>
        <p className="text-gray-200 mt-1 mb-4">Total Earnings</p>
        <Button 
            variant="gradient" 
            onClick={() => navigate('/referral')} 
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:ring-pink-400 py-3"
            icon={<UsersIcon className="w-5 h-5" />}
        >
          Refer & Earn
        </Button>
      </div>
    </div>
  );
};

export default HomePage;