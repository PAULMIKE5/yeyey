
import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EarnPage from './pages/EarnPage';
import WithdrawalPage from './pages/WithdrawalPage';
import ReferralPage from './pages/ReferralPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import { UserContext, User, WithdrawalRequest, UserContextType } from './contexts/UserContext';
import {} from './types/telegram'; 
import { ADMIN_USER_ID } from './constants';

const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'earningAppWithdrawalRequests';
const ALL_USERS_STORAGE_KEY = 'earningAppAllUsers';

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
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    let loadedUsers: User[] = [];
    try {
        const storedUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
        if (storedUsers) {
            loadedUsers = JSON.parse(storedUsers);
        }
    } catch (error) {
        console.error("Failed to load all users from localStorage:", error);
        // loadedUsers remains empty
    }

    const adminDefault = initialMockUsers.find(u => u.userId === ADMIN_USER_ID)!;
    const adminInLoaded = loadedUsers.find(u => u.userId === ADMIN_USER_ID);

    if (!adminInLoaded) {
        // If admin is not in loadedUsers (e.g. localStorage was empty or admin was missing),
        // add the default admin to the list.
        // We use a temporary array to avoid mutating loadedUsers if it was empty.
        const usersWithAdmin = [...loadedUsers.filter(u => u.userId !== ADMIN_USER_ID), adminDefault];
        return usersWithAdmin;
    }
    
    // If loadedUsers is empty and the above logic didn't add admin (which it should have),
    // or if we want a hard fallback.
    if (loadedUsers.length === 0) {
        return initialMockUsers; 
    }

    return loadedUsers;
  });
  
  const [currentUser, setCurrentUser] = useState<User>({
    name: 'User',
    earnings: 0,
    referralCode: 'NOTSET',
    photoUrl: undefined,
    userId: undefined,
    walletAddress: '',
    isBanned: false,
  });
  
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
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch (error) {
      console.error("Failed to save all users to localStorage:", error);
    }
  }, [allUsers]);

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

      if (tgUser && tgUser.id) {
        const fetchedUserId = tgUser.id;
        let displayName = tgUser.first_name || tgUser.username || 'User';
        if (tgUser.first_name && tgUser.last_name) {
          displayName = `${tgUser.first_name} ${tgUser.last_name}`;
        }
        const referral = `TG${fetchedUserId}`;

        // Data from allUsers state (which should be from localStorage or initialMockUsers)
        const userRecordFromState = allUsers.find(u => u.userId === fetchedUserId);

        let resolvedEarnings: number;
        let resolvedIsBanned: boolean;
        let resolvedJoinDate: string;
        let resolvedWalletAddress: string | undefined;

        if (userRecordFromState) {
          resolvedEarnings = userRecordFromState.earnings;
          resolvedIsBanned = userRecordFromState.isBanned || false;
          resolvedJoinDate = userRecordFromState.joinDate || new Date().toISOString().split('T')[0];
          resolvedWalletAddress = userRecordFromState.walletAddress;
        } else { // User not in current allUsers state (genuinely new or localStorage was empty for this user)
          if (fetchedUserId === ADMIN_USER_ID) {
            const adminDefaults = initialMockUsers.find(u => u.userId === ADMIN_USER_ID)!;
            resolvedEarnings = adminDefaults.earnings;
            resolvedIsBanned = adminDefaults.isBanned;
            resolvedJoinDate = adminDefaults.joinDate!;
            resolvedWalletAddress = adminDefaults.walletAddress;
          } else {
            resolvedEarnings = 0;
            resolvedIsBanned = false;
            resolvedJoinDate = new Date().toISOString().split('T')[0];
            resolvedWalletAddress = '';
          }
        }

        setCurrentUser({
          userId: fetchedUserId,
          name: displayName,
          photoUrl: tgUser.photo_url,
          referralCode: referral,
          earnings: resolvedEarnings,
          isBanned: resolvedIsBanned,
          joinDate: resolvedJoinDate,
          walletAddress: resolvedWalletAddress || '',
        });

        setAllUsers(prevAllUsers => {
          const userExistsInPrev = prevAllUsers.some(u => u.userId === fetchedUserId);
          if (userExistsInPrev) {
            return prevAllUsers.map(u =>
              u.userId === fetchedUserId
                ? {
                    ...u, // Spread existing fields from state
                    name: displayName, // Update from Telegram
                    photoUrl: tgUser.photo_url, // Update from Telegram
                    referralCode: referral, // Update from Telegram
                    // Persisted fields should be taken from resolvedValues,
                    // which reflect `userRecordFromState` or appropriate defaults
                    earnings: resolvedEarnings, 
                    isBanned: resolvedIsBanned,
                    joinDate: resolvedJoinDate,
                    // walletAddress is part of `...u` or handled by resolvedWalletAddress for currentUser
                  }
                : u
            );
          } else { // New user to add to allUsers state
            const newUser: User = {
              userId: fetchedUserId,
              name: displayName,
              earnings: resolvedEarnings,
              referralCode: referral,
              photoUrl: tgUser.photo_url,
              isBanned: resolvedIsBanned,
              joinDate: resolvedJoinDate,
              walletAddress: resolvedWalletAddress || '',
            };
            return [...prevAllUsers, newUser].sort((a,b) => (a.joinDate && b.joinDate) ? new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime() : 0);
          }
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount for Telegram initialization


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
     if (currentUser.userId) {
        setAllUsers(prev => prev.map(u => u.userId === currentUser.userId ? {...u, walletAddress: address} : u));
    }
  }, [currentUser.userId]);

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
        if (req.id === requestId && req.status === 'pending') { 
          if (status === 'declined') {
            setAllUsers(prevAll => prevAll.map(u => {
              if (u.userId === req.userId) {
                return {...u, earnings: (u.earnings || 0) + req.amount };
              }
              return u;
            }));
            if(currentUser.userId === req.userId) {
                setCurrentUser(prevCU => ({...prevCU, earnings: (prevCU.earnings || 0) + req.amount}));
            }
          }
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
          <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-purple-900 pb-16">
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
    