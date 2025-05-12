
import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, Beer, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useBeer } from '@/contexts/BeerContext';
import Navbar from '@/components/Navbar';

const Profile = () => {
  const { isAuthenticated, currentUser } = useUser();
  const { getUserEntries, getTotalConsumption } = useBeer();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" />;
  }

  const userEntries = getUserEntries(currentUser.id);
  const totalConsumption = getTotalConsumption(currentUser.id);
  
  // Calculate stats
  const recentEntries = userEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  const averageSize = userEntries.length > 0
    ? userEntries.reduce((sum, entry) => sum + entry.size, 0) / userEntries.length
    : 0;
  
  // Get the preferred beer type
  const beerTypeCount: Record<string, number> = {};
  userEntries.forEach(entry => {
    const type = entry.type || 'Unknown';
    beerTypeCount[type] = (beerTypeCount[type] || 0) + 1;
  });
  
  const preferredBeerType = Object.keys(beerTypeCount).reduce(
    (preferred, type) => 
      (beerTypeCount[type] > beerTypeCount[preferred] ? type : preferred),
    Object.keys(beerTypeCount)[0] || 'N/A'
  );

  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-beer-dark">Your Profile</h1>
          <p className="text-gray-600">View your beer consumption statistics and history.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="border-beer-dark">
              <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
                <CardTitle className="flex items-center text-xl font-bold">
                  <User className="mr-2 h-5 w-5" />
                  User Info
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-beer-dark rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-beer-cream" />
                  </div>
                  <h2 className="text-2xl font-bold text-beer-dark">{currentUser.name}</h2>
                  <p className="text-gray-600">{currentUser.email}</p>
                  
                  <div className="mt-8 w-full space-y-4">
                    <div className="bg-beer-cream rounded-lg p-4 border border-beer-dark">
                      <p className="text-sm text-gray-600">Total Consumption</p>
                      <p className="text-2xl font-bold text-beer-dark flex items-center">
                        <Beer className="mr-2 h-5 w-5 text-beer-amber" />
                        {totalConsumption.toFixed(1)}L
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-4 border border-beer-dark">
                      <p className="text-sm text-gray-600">Beers Logged</p>
                      <p className="text-2xl font-bold text-beer-dark">
                        {userEntries.length}
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-4 border border-beer-dark">
                      <p className="text-sm text-gray-600">Avg. Size</p>
                      <p className="text-2xl font-bold text-beer-dark">
                        {(averageSize / 1000).toFixed(2)}L
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-4 border border-beer-dark">
                      <p className="text-sm text-gray-600">Preferred Beer</p>
                      <p className="text-xl font-bold text-beer-dark">
                        {preferredBeerType}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="border-beer-dark h-full">
              <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
                <CardTitle className="flex items-center text-xl font-bold">
                  <Calendar className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6">
                {recentEntries.length > 0 ? (
                  <div className="space-y-4">
                    {recentEntries.map(entry => {
                      const date = new Date(entry.timestamp);
                      const formattedDate = date.toLocaleDateString();
                      const formattedTime = date.toLocaleTimeString();
                      
                      return (
                        <div key={entry.id} className="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                          <div className="w-12 h-12 bg-beer-amber rounded-full flex items-center justify-center mr-4">
                            <Beer className="h-6 w-6 text-beer-dark" />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-medium text-beer-dark">
                              {entry.type || 'Beer'} ({(entry.size / 1000).toFixed(2)}L)
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formattedDate} at {formattedTime}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Beer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>You haven't logged any beers yet.</p>
                    <p>Start tracking your beer consumption!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
