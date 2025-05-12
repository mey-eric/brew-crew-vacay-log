
import React, { createContext, useState, useContext, useEffect } from 'react';

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

// Sample users for demo purposes (in a real app, this would come from a database)
const SAMPLE_USERS: User[] = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { id: '2', name: 'Jane', email: 'jane@example.com' },
  { id: '3', name: 'Mike', email: 'mike@example.com' },
  { id: '4', name: 'Sarah', email: 'sarah@example.com' },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved user in localStorage on initial load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // In a real app, validate credentials against a backend
    // For now, just find a user with matching email
    const user = users.find(u => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return Promise.resolve();
    }
    
    return Promise.reject("Invalid email or password");
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return Promise.reject("User already exists");
    }

    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
    };

    // Add new user to the list
    setUsers([...users, newUser]);
    
    // Automatically log in the new user
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return Promise.resolve();
  };

  return (
    <UserContext.Provider value={{ currentUser, users, login, logout, signup, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
