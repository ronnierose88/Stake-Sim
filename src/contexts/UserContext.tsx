import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  username: string;
  balance: number;
  totalWagered: number;
  totalWinnings: number;
  createdAt: string;
}

interface BetHistory {
  id: string;
  game: string;
  betAmount: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: string;
}

interface UserContextType {
  user: User | null;
  betHistory: BetHistory[];
  login: (username: string) => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
  addBetHistory: (bet: Omit<BetHistory, 'id' | 'timestamp'>) => void;
  resetBalance: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [betHistory, setBetHistory] = useState<BetHistory[]>([]);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('casino-user');
    const storedHistory = localStorage.getItem('casino-bet-history');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedHistory) {
      setBetHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    // Save user data to localStorage
    if (user) {
      localStorage.setItem('casino-user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    // Save bet history to localStorage
    localStorage.setItem('casino-bet-history', JSON.stringify(betHistory));
  }, [betHistory]);

  const login = (username: string) => {
    const existingUser = localStorage.getItem(`casino-user-${username}`);
    
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      setUser(userData);
      toast.success(`Welcome back, ${username}!`);
    } else {
      const newUser: User = {
        username,
        balance: 1000,
        totalWagered: 0,
        totalWinnings: 0,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(`casino-user-${username}`, JSON.stringify(newUser));
      toast.success(`Welcome to StakeSim, ${username}! You've been credited $1,000!`);
    }
  };

  const logout = () => {
    setUser(null);
    setBetHistory([]);
    localStorage.removeItem('casino-user');
    localStorage.removeItem('casino-bet-history');
    toast.success('Logged out successfully');
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return prev;
      const newBalance = prev.balance + amount;
      const updatedUser = {
        ...prev,
        balance: newBalance,
        totalWinnings: amount > 0 ? prev.totalWinnings + amount : prev.totalWinnings,
        totalWagered: amount < 0 ? prev.totalWagered + Math.abs(amount) : prev.totalWagered,
      };
      
      localStorage.setItem(`casino-user-${prev.username}`, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const addBetHistory = (bet: Omit<BetHistory, 'id' | 'timestamp'>) => {
    const newBet: BetHistory = {
      ...bet,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setBetHistory(prev => [newBet, ...prev.slice(0, 19)]); // Keep only last 20 bets
  };

  const resetBalance = () => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, balance: 1000 };
      localStorage.setItem(`casino-user-${prev.username}`, JSON.stringify(updatedUser));
      return updatedUser;
    });
    
    toast.success('Balance reset to $1,000!');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        betHistory,
        login,
        logout,
        updateBalance,
        addBetHistory,
        resetBalance,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};