
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EarnPage from './pages/EarnPage';
import WithdrawalPage from './pages/WithdrawalPage';
import ReferralPage from './pages/ReferralPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage'; // Ensured relative path
import Navbar from './components/Navbar';
import { UserContext, User, WithdrawalRequest, UserContextType } from './contexts/UserContext';
import {} from './types/telegram'; 
import { ADMIN_USER_ID } from './constants';

// localStorage key
const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'earningAppWithdrawalRequests';

// Initial users: Only the admin user as a base. Others will be added dynamically.
const initialMockUsers: User[] = [
  { 
    userId: ADMIN_USER_ID, 
    name: 'Admin User', 
    earnings: 99999, 
    referralCode: `TG${ADMIN_USER_ID}`, 
    photoUrl: `https://picsum.photos/seed/${ADMIN_USER_ID}/100/100`, 
    isBanned: false, 
    joinDate: '2022-12-01' 
  }
];


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    name: 'User',
    earnings: 0,
    referralCode: 'NOTSET', // Will be set based on Telegram ID
    photoUrl: undefined,
    userId: undefined,
    walletAddress: '',
    isBanned: false,
  });

  const [allUsers, setAllUsers] = useState<User[]>(initialMockUsers);
  
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    try {
      const storedRequests = localStorage.getItem(WITHDRAWAL_REQUESTS_STORAGE_KEY);
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      console.error("Failed to load withdrawal requests from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WITHDRAWAL_REQUESTS_STORAGE_KEY, JSON.stringify(withdrawalRequests));
    } catch (error) {
      console.error("Failed to save withdrawal requests to localStorage:", error);
    }
  }, [withdrawalRequests]);


  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const tgUser = tg.initDataUnsafe?.user;

      if (tgUser) {
        let displayName = 'User';
        if (tgUser.first_name && tgUser.last_name) {
          displayName = `${tgUser.first_name} ${tgUser.last_name}`;
        } else if (tgUser.first_name) {
          displayName = tgUser.first_name;
        } else if (tgUser.username) {
          displayName = tgUser.username;
        }
        
        const referral = tgUser.id ? `TG${tgUser.id}` : 'NOTSETYET';
        const fetchedUserId = tgUser.id;

        // Determine initial earnings for the current user when they first load the app
        // This tries to load from allUsers, or defaults for a brand new user
        const existingUserRecord = allUsers.find(u => u.userId === fetchedUserId);
        const initialEarnings = existingUserRecord ? existingUserRecord.earnings : 0; // Default to 0 for new users
        const initialJoinDate = existingUserRecord ? existingUserRecord.joinDate : new Date().toISOString().split('T')[0];
        const initialIsBanned = existingUserRecord ? existingUserRecord.isBanned : false;


        setCurrentUser(prevUser => ({
          ...prevUser,
          userId: fetchedUserId,
          name: displayName,
          photoUrl: tgUser.photo_url,
          referralCode: referral,
          earnings: initialEarnings, // Set earnings from existing record or default
          isBanned: initialIsBanned,
          joinDate: initialJoinDate
        }));
        
        setAllUsers(prevAllUsers => {
          const userExists = prevAllUsers.some(u => u.userId === fetchedUserId);
          
          if (fetchedUserId === ADMIN_USER_ID) {
            return prevAllUsers.map(u => 
              u.userId === ADMIN_USER_ID 
              ? { ...u, name: displayName, photoUrl: tgUser.photo_url, referralCode: referral, userId: fetchedUserId, earnings: u.earnings, isBanned: u.isBanned, joinDate: u.joinDate } 
              : u
            );
          } else if (userExists) {
            return prevAllUsers.map(u => 
              u.userId === fetchedUserId 
              ? { ...u, name: displayName, photoUrl: tgUser.photo_url, referralCode: referral, earnings: u.earnings, isBanned: u.isBanned, joinDate: u.joinDate } 
              : u
            );
          } else if (fetchedUserId) {
            const newUser: User = { 
              userId: fetchedUserId, 
              name: displayName, 
              earnings: 0, // New users start with 0 earnings
              referralCode: referral, 
              photoUrl: tgUser.photo_url, 
              isBanned: false, 
              joinDate: new Date().toISOString().split('T')[0] 
            };
            return [...prevAllUsers, newUser].sort((a,b) => (a.joinDate && b.joinDate) ? new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime() : 0);
          }
          return prevAllUsers; 
        });

      }
    }
  }, []); // Run once on mount

  const addEarnings = useCallback((amount: number) => {
    setCurrentUser(prevUser => ({ ...prevUser, earnings: prevUser.earnings + amount }));
     if (currentUser.userId) {
        setAllUsers(prev => prev.map(u => u.userId === currentUser.userId ? {...u, earnings: (u.earnings || 0) + amount} : u));
    }
  }, [currentUser.userId]);

  const setUserName = useCallback((name: string) => {
    setCurrentUser(prevUser => ({...prevUser, name}));
    if (currentUser.userId) {
        setAllUsers(prev => prev.map(u => u.userId === currentUser.userId ? {...u, name} : u));
    }
  }, [currentUser.userId]);
  
  const setWalletAddress = useCallback((address: string) => {
    setCurrentUser(prevUser => ({...prevUser, walletAddress: address}));
  }, []);

  const setTelegramUser = useCallback((telegramUser: Partial<User>) => {
    setCurrentUser(prevUser => ({...prevUser, ...telegramUser}));
  }, []);

  const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'status' | 'date' | 'userName' | 'userId'>): boolean => {
    if(!currentUser.userId || !currentUser.name) {
        alert("User information is missing. Cannot submit request.");
        return false;
    }
    if (currentUser.earnings < request.amount) {
        alert("Insufficient funds to make this withdrawal request.");
        return false;
    }

    // Deduct earnings immediately
    const newEarnings = currentUser.earnings - request.amount;
    setCurrentUser(prevUser => ({ ...prevUser, earnings: newEarnings }));
    setAllUsers(prevAll => prevAll.map(u => 
      u.userId === currentUser.userId ? { ...u, earnings: newEarnings } : u
    ));

    const newRequest: WithdrawalRequest = {
      ...request,
      id: `WR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.userId,
      userName: currentUser.name,
      status: 'pending',
      date: new Date().toISOString(),
    };
    setWithdrawalRequests(prevRequests => [newRequest, ...prevRequests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return true;
  }, [currentUser.userId, currentUser.name, currentUser.earnings]);

  const updateWithdrawalStatus = useCallback((requestId: string, status: 'approved' | 'declined') => {
    setWithdrawalRequests(prevRequests =>
      prevRequests.map(req => {
        if (req.id === requestId && req.status === 'pending') { // Only update pending requests
          if (status === 'declined') {
            // Refund the amount to the user
            setAllUsers(prevAll => prevAll.map(u => {
              if (u.userId === req.userId) {
                return {...u, earnings: (u.earnings || 0) + req.amount };
              }
              return u;
            }));
            // If current user is the one whose request is declined, update their earnings too
            if(currentUser.userId === req.userId) {
                setCurrentUser(prevCU => ({...prevCU, earnings: (prevCU.earnings || 0) + req.amount}));
            }
          }
          // If approved, earnings were already deducted on submission. No change to earnings here.
          return { ...req, status };
        }
        return req;
      })
    );
  }, [currentUser.userId]);

  const toggleUserBanStatus = useCallback((userIdToToggle: number) => {
    setAllUsers(prevUsers =>
      prevUsers.map(u =>
        u.userId === userIdToToggle ? { ...u, isBanned: !u.isBanned } : u
      )
    );
    if (currentUser.userId === userIdToToggle) {
        setCurrentUser(prev => {
            const newBanStatus = !prev.isBanned;
            if(newBanStatus){ 
                alert("Your account has been banned by an administrator.");
            }
            return {...prev, isBanned: newBanStatus};
        });
    }
  }, [currentUser.userId]);
  
  const userContextValue: UserContextType = {
    user: currentUser,
    allUsers,
    withdrawalRequests,
    addEarnings,
    setUserName,
    setWalletAddress,
    setTelegramUser,
    submitWithdrawalRequest,
    updateWithdrawalStatus,
    toggleUserBanStatus,
  };

  if (currentUser.isBanned) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1A1032] to-[#0F0A21] text-white font-sans max-w-lg mx-auto shadow-2xl items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Account Suspended</h1>
        <p className="text-center text-gray-300">Your account has been suspended. Please contact support for more information.</p>
      </div>
    );
  }


  return (
    <UserContext.Provider value={userContextValue}>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1A1032] to-[#0F0A21] text-white font-sans max-w-lg mx-auto shadow-2xl">
          <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900 pb-16"> {/* Added pb-16 for navbar */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/earn" element={<EarnPage />} />
              <Route path="/withdraw" element={<WithdrawalPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {currentUser.userId === ADMIN_USER_ID && (
                <Route path="/admin" element={<AdminPage />} />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Navbar />
        </div>
      </HashRouter>
    </UserContext.Provider>
  );
};

export default App;