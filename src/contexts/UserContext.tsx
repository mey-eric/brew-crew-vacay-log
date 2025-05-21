
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  login: async () => {},
  logout: () => {},
  signup: async () => {},
  isAuthenticated: false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for current session on initial load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { user } = data.session;
        if (user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          setCurrentUser({
            id: user.id,
            name: profileData?.name || 'User',
            email: user.email || '',
          });
          setIsAuthenticated(true);
        }
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', session.user.id)
            .single();

          setCurrentUser({
            id: session.user.id,
            name: profileData?.name || 'User',
            email: session.user.email || '',
          });
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Fetch all users (for the leaderboard)
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, email');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // User will be set via the auth state change listener
      toast("Successfully logged in");
    } catch (error) {
      console.error('Login failed:', error);
      toast("Invalid email or password");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email,
            },
          ]);

        if (profileError) throw profileError;

        toast("Account created successfully");
        
        // User will be set via the auth state change listener
      }
    } catch (error) {
      console.error('Signup failed:', error);
      toast("Failed to create account");
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, users, login, logout, signup, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
