
import React from 'react';
import { Link } from 'react-router-dom';
import { Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beer-cream px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block p-6 bg-beer-amber rounded-full transform -rotate-12">
            <Beer className="h-16 w-16 text-beer-dark" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-beer-dark mb-4">404</h1>
        <p className="text-2xl text-beer-dark mb-8">Oops! This page seems to have spilled</p>
        
        <Link to="/">
          <Button className="bg-beer-amber hover:bg-beer-dark text-beer-dark hover:text-beer-cream px-6 py-3 text-lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
