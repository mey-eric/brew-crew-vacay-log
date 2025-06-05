
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
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-beer-dark">Your Profile</h1>
          <p className="text-sm md:text-base text-gray-600">View your beer consumption statistics and history.</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 order-1">
            <Card className="border-beer-dark">
              <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
                <CardTitle className="flex items-center text-lg md:text-xl font-bold">
                  <User className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  User Info
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-beer-dark rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 md:h-12 md:w-12 text-beer-cream" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-beer-dark text-center">{currentUser.name}</h2>
                  <p className="text-sm md:text-base text-gray-600 text-center mb-6">{currentUser.email}</p>
                  
                  <div className="w-full grid grid-cols-2 gap-3 md:space-y-0 md:grid-cols-1 md:gap-4">
                    <div className="bg-beer-cream rounded-lg p-3 md:p-4 border border-beer-dark">
                      <p className="text-xs md:text-sm text-gray-600">Total Consumption</p>
                      <p className="text-lg md:text-2xl font-bold text-beer-dark flex items-center">
                        <Beer className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-beer-amber" />
                        {totalConsumption.toFixed(1)}L
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-3 md:p-4 border border-beer-dark">
                      <p className="text-xs md:text-sm text-gray-600">Beers Logged</p>
                      <p className="text-lg md:text-2xl font-bold text-beer-dark">
                        {userEntries.length}
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-3 md:p-4 border border-beer-dark">
                      <p className="text-xs md:text-sm text-gray-600">Avg. Size</p>
                      <p className="text-lg md:text-2xl font-bold text-beer-dark">
                        {(averageSize / 1000).toFixed(2)}L
                      </p>
                    </div>
                    
                    <div className="bg-beer-cream rounded-lg p-3 md:p-4 border border-beer-dark">
                      <p className="text-xs md:text-sm text-gray-600">Preferred Beer</p>
                      <p className="text-sm md:text-xl font-bold text-beer-dark">
                        {preferredBeerType}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2 order-2">
            <Card className="border-beer-dark h-full">
              <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
                <CardTitle className="flex items-center text-lg md:text-xl font-bold">
                  <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-4 md:pt-6">
                {recentEntries.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {recentEntries.map(entry => {
                      const date = new Date(entry.timestamp);
                      const formattedDate = date.toLocaleDateString();
                      const formattedTime = date.toLocaleTimeString();
                      
                      return (
                        <div key={entry.id} className="flex items-center bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-beer-amber rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                            <Beer className="h-5 w-5 md:h-6 md:w-6 text-beer-dark" />
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-beer-dark text-sm md:text-base">
                              {entry.type || 'Beer'} ({(entry.size / 1000).toFixed(2)}L)
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600 truncate">
                              {formattedDate} at {formattedTime}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12 text-gray-500">
                    <Beer className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm md:text-base">You haven't logged any beers yet.</p>
                    <p className="text-sm md:text-base">Start tracking your beer consumption!</p>
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
