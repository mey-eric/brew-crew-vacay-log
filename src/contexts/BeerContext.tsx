
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import { beerApiService } from '@/services/beerApiService';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

// Types
export interface BeerEntry {
  id: string;
  userId: string;
  userName: string;
  size: number; // Size in milliliters
  timestamp: string;
  type?: string;
}

interface BeerContextType {
  entries: BeerEntry[];
  addEntry: (size: number, type?: string) => void;
  getUserEntries: (userId: string) => BeerEntry[];
  getEntriesInTimeRange: (startDate: Date, endDate: Date) => BeerEntry[];
  getUserEntriesInTimeRange: (userId: string, startDate: Date, endDate: Date) => BeerEntry[];
  getTotalConsumption: (userId?: string) => number;
  isLoading: boolean;
}

// Create context with default values
const BeerContext = createContext<BeerContextType>({
  entries: [],
  addEntry: () => {},
  getUserEntries: () => [],
  getEntriesInTimeRange: () => [],
  getUserEntriesInTimeRange: () => [],
  getTotalConsumption: () => 0,
  isLoading: false,
});

export const BeerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users } = useUser();
  const [entries, setEntries] = useState<BeerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('beer_entries_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'beer_entries'
      }, payload => {
        console.log('Change received!', payload);
        // Refresh entries when data changes
        loadEntries();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    // Load saved entries from Supabase on initial load
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const loadedEntries = await beerApiService.getAllEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading beer entries:', error);
      toast("Failed to load beer data. Please try refreshing the page");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new beer entry
  const addEntry = async (size: number, type?: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const newEntryData = {
        userId: currentUser.id,
        userName: currentUser.name,
        size,
        timestamp: new Date().toISOString(),
        type,
      };
      
      const newEntry = await beerApiService.addEntry(newEntryData);
      
      // Update local state
      setEntries(prevEntries => [...prevEntries, newEntry]);
      
      toast(`Beer added! You've added a ${size}ml ${type}.`);
    } catch (error) {
      console.error('Error adding beer entry:', error);
      toast("Failed to add beer. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Get entries for a specific user
  const getUserEntries = (userId: string): BeerEntry[] => {
    return entries.filter(entry => entry.userId === userId);
  };

  // Get entries within a time range
  const getEntriesInTimeRange = (startDate: Date, endDate: Date): BeerEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  // Get user entries within a time range
  const getUserEntriesInTimeRange = (userId: string, startDate: Date, endDate: Date): BeerEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entry.userId === userId && entryDate >= startDate && entryDate <= endDate;
    });
  };

  // Get total consumption in liters for a user or all users
  const getTotalConsumption = (userId?: string): number => {
    const filteredEntries = userId 
      ? entries.filter(entry => entry.userId === userId)
      : entries;
    
    return filteredEntries.reduce((total, entry) => total + entry.size, 0) / 1000; // Convert to liters
  };

  return (
    <BeerContext.Provider value={{ 
      entries, 
      addEntry, 
      getUserEntries, 
      getEntriesInTimeRange, 
      getUserEntriesInTimeRange, 
      getTotalConsumption,
      isLoading
    }}>
      {children}
    </BeerContext.Provider>
  );
};

export const useBeer = () => useContext(BeerContext);
