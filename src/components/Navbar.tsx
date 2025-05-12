
import React from 'react';
import { Link } from 'react-router-dom';
import { Beer, User, LogOut, ChartBar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useUser();

  return (
    <nav className="bg-beer-amber border-b border-beer-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Beer className="h-8 w-8 text-beer-dark" />
              <span className="ml-2 text-xl font-bold text-beer-dark">BeerTracker</span>
            </Link>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="text-beer-dark hover:text-beer-red hover:bg-beer-cream">
                  <ChartBar className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button variant="ghost" className="text-beer-dark hover:text-beer-red hover:bg-beer-cream">
                  <User className="mr-2 h-4 w-4" />
                  {currentUser?.name || 'Profile'}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={logout}
                className="border-beer-dark text-beer-dark hover:bg-beer-dark hover:text-beer-cream"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-beer-dark text-beer-dark hover:bg-beer-dark hover:text-beer-cream">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-beer-dark text-beer-cream hover:bg-beer-red">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
