
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar';
import AddBeerForm from '@/components/AddBeerForm';
import ConsumptionGraph from '@/components/ConsumptionGraph';
import Leaderboard from '@/components/Leaderboard';

const Dashboard = () => {
  const { isAuthenticated, currentUser } = useUser();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-beer-dark">Welcome, {currentUser?.name}!</h1>
          <p className="text-gray-600">Track and compare your beer consumption with friends.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <AddBeerForm />
              <Leaderboard />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <ConsumptionGraph />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
