
import { BeerEntry } from '@/contexts/BeerContext';
import { supabase } from '@/lib/supabase';

export const beerApiService = {
  // Get all beer entries
  getAllEntries: async (): Promise<BeerEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('beer_entries')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching beer entries:', error);
      throw new Error('Failed to fetch beer entries');
    }
  },

  // Add a new beer entry
  addEntry: async (entry: Omit<BeerEntry, 'id'>): Promise<BeerEntry> => {
    try {
      const { data, error } = await supabase
        .from('beer_entries')
        .insert([entry])
        .select()
        .single();
        
      if (error) throw error;
      
      return data as BeerEntry;
    } catch (error) {
      console.error('Error adding beer entry:', error);
      throw new Error('Failed to add beer entry');
    }
  },

  // Get entries for a specific user
  getUserEntries: async (userId: string): Promise<BeerEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('beer_entries')
        .select('*')
        .eq('userId', userId);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user beer entries:', error);
      throw new Error('Failed to fetch user beer entries');
    }
  },

  // Get entries within a specific time range
  getEntriesInTimeRange: async (startDate: Date, endDate: Date): Promise<BeerEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('beer_entries')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching entries in time range:', error);
      throw new Error('Failed to fetch entries in time range');
    }
  }
};
