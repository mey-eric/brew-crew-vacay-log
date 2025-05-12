
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import { beerApiService } from '@/services/beerApiService';
import { toast } from '@/components/ui/sonner';

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

// Sample initial beer entries for demo
const SAMPLE_ENTRIES: BeerEntry[] = [
  { id: '1', userId: '1', userName: 'John', size: 500, timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'Lager' },
  { id: '2', userId: '2', userName: 'Jane', size: 330, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'IPA' },
  { id: '3', userId: '1', userName: 'John', size: 500, timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Stout' },
  { id: '4', userId: '3', userName: 'Mike', size: 1000, timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), type: 'Pilsner' },
  { id: '5', userId: '4', userName: 'Sarah', size: 330, timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), type: 'Wheat Beer' },
  { id: '6', userId: '2', userName: 'Jane', size: 500, timestamp: new Date(Date.now() - 86400000 * 0.2).toISOString(), type: 'Pale Ale' },
];

export const BeerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users } = useUser();
  const [entries, setEntries] = useState<BeerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved entries from API on initial load
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        // Check if we have entries in localStorage already
        const savedEntries = localStorage.getItem('beerEntries');
        if (!savedEntries) {
          // Use sample data for first load
          localStorage.setItem('beerEntries', JSON.stringify(SAMPLE_ENTRIES));
        }
        
        // Then fetch via API
        const loadedEntries = await beerApiService.getAllEntries();
        setEntries(loadedEntries);
      } catch (error) {
        console.error('Error loading beer entries:', error);
        toast({
          title: "Failed to load beer data",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntries();
  }, []);

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
      
      toast({
        title: "Beer added!",
        description: `You've added a ${size}ml ${type}.`,
      });
    } catch (error) {
      console.error('Error adding beer entry:', error);
      toast({
        title: "Failed to add beer",
        description: "Please try again",
        variant: "destructive",
      });
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
