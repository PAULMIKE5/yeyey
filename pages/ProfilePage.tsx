
import React, { useContext, useState, useEffect } from 'react';
import Button from '../components/Button';
import { UserContext } from '../contexts/UserContext';

const ProfilePage: React.FC = () => {
  const context = useContext(UserContext);
  const [isEditingName, setIsEditingName] = useState(false);
  
  if (!context) return <div>Loading...</div>;
  const { user, setUserName } = context;
  const [currentName, setCurrentName] = useState(user.name);

  useEffect(() => {
    setCurrentName(user.name);
  }, [user.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(e.target.value);
  };

  const saveName = () => {
    setUserName(currentName);
    setIsEditingName(false);
  };

  const profileImageSrc = user.photoUrl ? user.photoUrl : `https://picsum.photos/seed/${user.userId || user.name}/100/100`;
  const displayJoinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Not available';

  return (
    <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="bg-[#2D1A4B] p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={profileImageSrc}
            alt="User avatar" 
            className="w-24 h-24 rounded-full border-4 border-purple-500 object-cover mb-4"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              const fallbackSrc = `https://picsum.photos/seed/${user.userId || user.name}/100/100`;
              if (target.src !== fallbackSrc) {
                target.src = fallbackSrc;
              }
            }}
          />
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={currentName} 
                onChange={handleNameChange}
                className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-xl font-semibold"
                aria-label="Edit user name"
              />
              <Button onClick={saveName} variant="primary" className="py-2 px-3 text-sm">Save</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <button onClick={() => setIsEditingName(true)} className="text-purple-400 hover:text-purple-300" aria-label="Edit name">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-gray-400 text-sm mt-1">Joined: {displayJoinDate}</p>
           {user.userId && <p className="text-gray-400 text-xs mt-1">ID: {user.userId}</p>}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Earnings</p>
            <p className="text-xl font-semibold text-green-400">${(user.earnings || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Referral Code</p>
            <p className="text-xl font-semibold text-yellow-300">{user.referralCode}</p>
          </div>
          
          <Button variant="secondary" className="w-full py-3" onClick={() => alert('Account settings functionality is not yet implemented.')}>
            Account Settings
          </Button>
          {/* Logout button removed as per request */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
