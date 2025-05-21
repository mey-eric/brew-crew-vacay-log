
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Session } from '@supabase/supabase-js';

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
  const [session, setSession] = useState<Session | null>(null);

  // Check for current session on initial load and set up auth listener
  useEffect(() => {
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          
          // Get user profile data
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', session.user.id)
                .single();
  
              if (error) throw error;
    
              setCurrentUser({
                id: session.user.id,
                name: profileData?.name || 'User',
                email: session.user.email || '',
              });
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got session:", session);
      if (session?.user) {
        setSession(session);
        
        // Get user profile data
        supabase
          .from('user_profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              return;
            }
            
            setCurrentUser({
              id: session.user.id,
              name: profileData?.name || 'User',
              email: session.user.email || '',
            });
            setIsAuthenticated(true);
          });
      }
    });

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
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      // User will be set via the auth state change listener
      console.log('Login successful:', data);
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
      console.log("Signing up with:", { name, email });
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful:', data);

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

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

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
