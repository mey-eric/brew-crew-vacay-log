
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useBeer } from '@/contexts/BeerContext';
import Navbar from '@/components/Navbar';
import AddBeerForm from '@/components/AddBeerForm';
import AddPurchaseForm from '@/components/AddPurchaseForm';
import PurchaseHistory from '@/components/PurchaseHistory';
import ConsumptionGraph from '@/components/ConsumptionGraph';
import AlcoholTrackingGraph from '@/components/AlcoholTrackingGraph';
import Leaderboard from '@/components/Leaderboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, currentUser } = useUser();
  const { isLoading } = useBeer();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-beer-dark">Welcome, {currentUser?.name}!</h1>
            <p className="text-sm md:text-base text-gray-600">Track and compare your beer consumption with friends.</p>
          </div>
          {isLoading && (
            <div className="flex items-center text-beer-amber">
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-2" />
              <span className="text-sm md:text-base">Syncing data...</span>
            </div>
          )}
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-4 md:space-y-6">
              <AddBeerForm />
              <AddPurchaseForm />
              <PurchaseHistory />
              <Leaderboard />
            </div>
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-4 md:space-y-6">
              <AlcoholTrackingGraph />
              <ConsumptionGraph />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
