
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

  // Create or update user profile
  const createOrUpdateProfile = async (userId: string, name: string, email: string) => {
    try {
      console.log("Creating/updating profile for:", { userId, name, email });
      const { error } = await supabase
        .from('user_profiles')
        .upsert([
          {
            id: userId,
            name: name || 'User',
            email: email || '',
          },
        ], { onConflict: 'id' });

      if (error) {
        console.error("Error creating/updating profile:", error);
        return false;
      }
      
      console.log("Profile created/updated successfully");
      return true;
    } catch (err) {
      console.error("Exception in createOrUpdateProfile:", err);
      return false;
    }
  };

  // Helper function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        console.log("Profile data found:", data);
        return data;
      } else {
        console.warn("No profile data found for user");
        return null;
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      return null;
    }
  };

  // Check for current session on initial load and set up auth listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Get existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session);
      if (session?.user) {
        setSession(session);
        setIsAuthenticated(true);
        
        // Fetch user profile in a non-blocking way
        setTimeout(async () => {
          const profileData = await fetchUserProfile(session.user.id);
          
          if (profileData) {
            setCurrentUser({
              id: session.user.id,
              name: profileData.name || 'User',
              email: profileData.email || session.user.email || '',
            });
          } else {
            // If no profile exists but we have a session, create a default profile
            const name = session.user.user_metadata?.name || 'User';
            const email = session.user.email || '';
            
            await createOrUpdateProfile(session.user.id, name, email);
            
            setCurrentUser({
              id: session.user.id,
              name,
              email,
            });
          }
        }, 0);
      }
    });
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (session) {
          console.log("Session user:", session.user);
          setSession(session);
          setIsAuthenticated(true);
          
          // Get user profile data
          if (session.user) {
            // Use setTimeout to prevent Supabase auth state deadlocks
            setTimeout(async () => {
              const profileData = await fetchUserProfile(session.user.id);
              
              if (profileData) {
                setCurrentUser({
                  id: session.user.id,
                  name: profileData.name || 'User',
                  email: profileData.email || session.user.email || '',
                });
              } else {
                // If no profile exists but we have a session, create a default profile
                const name = session.user.user_metadata?.name || 'User';
                const email = session.user.email || '';
                
                await createOrUpdateProfile(session.user.id, name, email);
                
                setCurrentUser({
                  id: session.user.id,
                  name,
                  email,
                });
              }
            }, 0);
          }
        } else {
          setCurrentUser(null);
          setSession(null);
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
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error("Login failed: " + error.message);
        throw error;
      }

      console.log('Login successful:', data);
      
      // We don't set user state here - the auth state listener will handle that
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        toast.error("Login failed: " + error.message);
      } else {
        toast.error("Invalid email or password");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Logout failed");
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      console.log("Signing up with:", { name, email });
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name // Store the name in user_metadata
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error("Signup failed: " + error.message);
        throw error;
      }

      console.log('Signup successful:', data);

      if (data.user) {
        // Create profile entry
        const profileCreated = await createOrUpdateProfile(data.user.id, name, email);
        
        if (!profileCreated) {
          console.error('Profile creation failed');
          toast.error("Your account was created, but profile setup failed");
        } else {
          toast.success("Account created successfully");
          console.log("User profile created successfully");
        }
      }
    } catch (error) {
      console.error('Signup failed:', error);
      if (error instanceof Error) {
        toast.error("Failed to create account: " + error.message);
      } else {
        toast.error("Failed to create account");
      }
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
