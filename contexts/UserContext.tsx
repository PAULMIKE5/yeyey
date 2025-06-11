
import React, { createContext, useContext } from 'react';

export interface User {
  userId?: number; // Telegram User ID
  name: string;
  earnings: number;
  referralCode: string;
  photoUrl?: string;
  walletAddress?: string; // For withdrawal
  isBanned?: boolean; // For admin panel
  joinDate?: string; // Mock join date
}

export interface WithdrawalRequest {
  id: string;
  userId: number;
  userName: string;
  amount: number;
  walletAddress: string;
  method: string;
  status: 'pending' | 'approved' | 'declined';
  date: string;
}

export interface UserContextType {
  user: User;
  allUsers: User[]; // For admin panel - list of all users
  withdrawalRequests: WithdrawalRequest[]; // For admin panel
  addEarnings: (amount: number) => void;
  setUserName: (name: string) => void;
  setWalletAddress: (address: string) => void;
  setTelegramUser: (telegramUser: Partial<User>) => void;
  submitWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'date' | 'userName' | 'userId'>) => boolean; // Updated return type
  updateWithdrawalStatus: (requestId: string, status: 'approved' | 'declined') => void;
  toggleUserBanStatus: (userId: number) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};