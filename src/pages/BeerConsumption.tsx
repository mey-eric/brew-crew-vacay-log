
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar';
import ConsumptionGraph from '@/components/ConsumptionGraph';

const BeerConsumption = () => {
  const { isAuthenticated } = useUser();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-beer-dark mb-2">Beer Consumption Analytics</h1>
          <p className="text-sm md:text-base text-gray-600">Detailed view of beer consumption patterns and trends.</p>
        </header>
        
        <ConsumptionGraph isFullScreen={true} />
      </div>
    </div>
  );
};

export default BeerConsumption;
