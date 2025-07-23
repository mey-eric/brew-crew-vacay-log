
import React from 'react';
import { Link } from 'react-router-dom';
import { Beer, User, LogOut, ChartBar, Settings, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = ({ mobile = false }) => (
    <>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" onClick={mobile ? () => setIsOpen(false) : undefined}>
            <Button variant="ghost" className={`text-beer-dark hover:text-beer-red hover:bg-beer-cream ${mobile ? 'w-full justify-start' : ''}`}>
              <ChartBar className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/profile" onClick={mobile ? () => setIsOpen(false) : undefined}>
            <Button variant="ghost" className={`text-beer-dark hover:text-beer-red hover:bg-beer-cream ${mobile ? 'w-full justify-start' : ''}`}>
              <User className="mr-2 h-4 w-4" />
              {mobile ? 'Profile' : (currentUser?.name || 'Profile')}
            </Button>
          </Link>
          
          <Link to="/admin" onClick={mobile ? () => setIsOpen(false) : undefined}>
            <Button variant="ghost" className={`text-beer-dark hover:text-beer-red hover:bg-beer-cream text-xs opacity-60 ${mobile ? 'w-full justify-start' : ''}`}>
              <Settings className="mr-2 h-3 w-3" />
              Admin
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => {
              logout();
              if (mobile) setIsOpen(false);
            }}
            className={`border-beer-dark text-beer-dark hover:bg-beer-dark hover:text-beer-cream ${mobile ? 'w-full justify-start' : ''}`}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={mobile ? () => setIsOpen(false) : undefined}>
            <Button variant="outline" className={`border-beer-dark text-beer-dark hover:bg-beer-dark hover:text-beer-cream ${mobile ? 'w-full justify-start' : ''}`}>
              Login
            </Button>
          </Link>
          <Link to="/signup" onClick={mobile ? () => setIsOpen(false) : undefined}>
            <Button className={`bg-beer-dark text-beer-cream hover:bg-beer-red ${mobile ? 'w-full justify-start' : ''}`}>
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-beer-amber border-b border-beer-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Beer className="h-6 w-6 sm:h-8 sm:w-8 text-beer-dark" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-beer-dark">BeerTracker</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-beer-dark">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] bg-beer-cream border-beer-dark">
                <div className="flex flex-col space-y-3 mt-6">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
