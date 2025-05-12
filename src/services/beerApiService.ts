
import { BeerEntry } from '@/contexts/BeerContext';

// This is a simulation of API calls using localStorage
// In a real application, these would be actual API calls to a backend server
export const beerApiService = {
  // Get all beer entries
  getAllEntries: async (): Promise<BeerEntry[]> => {
    try {
      const data = localStorage.getItem('beerEntries');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error fetching beer entries:', error);
      throw new Error('Failed to fetch beer entries');
    }
  },

  // Add a new beer entry
  addEntry: async (entry: Omit<BeerEntry, 'id'>): Promise<BeerEntry> => {
    try {
      const existingData = localStorage.getItem('beerEntries');
      let entries: BeerEntry[] = existingData ? JSON.parse(existingData) : [];
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEntry: BeerEntry = {
        ...entry,
        id: Date.now().toString()
      };
      
      entries = [...entries, newEntry];
      localStorage.setItem('beerEntries', JSON.stringify(entries));
      
      return newEntry;
    } catch (error) {
      console.error('Error adding beer entry:', error);
      throw new Error('Failed to add beer entry');
    }
  },

  // Get entries for a specific user
  getUserEntries: async (userId: string): Promise<BeerEntry[]> => {
    try {
      const data = localStorage.getItem('beerEntries');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data) {
        const entries: BeerEntry[] = JSON.parse(data);
        return entries.filter(entry => entry.userId === userId);
      }
      return [];
    } catch (error) {
      console.error('Error fetching user beer entries:', error);
      throw new Error('Failed to fetch user beer entries');
    }
  },

  // Get entries within a specific time range
  getEntriesInTimeRange: async (startDate: Date, endDate: Date): Promise<BeerEntry[]> => {
    try {
      const data = localStorage.getItem('beerEntries');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (data) {
        const entries: BeerEntry[] = JSON.parse(data);
        return entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching entries in time range:', error);
      throw new Error('Failed to fetch entries in time range');
    }
  }
};
