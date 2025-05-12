
import React from 'react';
import { Trophy, Beer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';

const Leaderboard = () => {
  const { users } = useUser();
  const { getTotalConsumption } = useBeer();

  // Calculate user rankings based on total consumption
  const rankings = users
    .map(user => ({
      id: user.id,
      name: user.name,
      totalLiters: getTotalConsumption(user.id),
    }))
    .sort((a, b) => b.totalLiters - a.totalLiters);

  // Calculate group total
  const groupTotal = rankings.reduce((total, user) => total + user.totalLiters, 0);

  // Get position-specific styles and icons
  const getPositionStyle = (position: number) => {
    switch (position) {
      case 0: // Gold
        return {
          background: 'bg-yellow-100',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          medal: '🥇'
        };
      case 1: // Silver
        return {
          background: 'bg-gray-100',
          border: 'border-gray-400',
          text: 'text-gray-700',
          medal: '🥈'
        };
      case 2: // Bronze
        return {
          background: 'bg-amber-50',
          border: 'border-amber-500',
          text: 'text-amber-700',
          medal: '🥉'
        };
      default:
        return {
          background: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-700',
          medal: ''
        };
    }
  };

  // Calculate the percentage contribution to the total
  const getPercentage = (liters: number) => {
    if (groupTotal === 0) return 0;
    return (liters / groupTotal) * 100;
  };

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <CardTitle className="flex items-center text-xl font-bold">
          <Trophy className="mr-2 h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {rankings.map((user, index) => {
            const style = getPositionStyle(index);
            const percentage = getPercentage(user.totalLiters);
            
            return (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-lg border ${style.border} ${style.background}`}
              >
                <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                  {style.medal || index + 1}
                </div>
                
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-medium ${style.text}`}>{user.name}</h3>
                    <div className="flex items-center">
                      <Beer className={`h-4 w-4 mr-1 ${style.text}`} />
                      <span className={`font-semibold ${style.text}`}>
                        {user.totalLiters.toFixed(1)}L
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full bg-beer-amber`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of group total
                  </div>
                </div>
              </div>
            );
          })}

          {rankings.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No data available yet. Start tracking your beers!
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Group Total</span>
            <span className="font-bold text-beer-dark flex items-center">
              <Beer className="mr-1 h-5 w-5 text-beer-amber" />
              {groupTotal.toFixed(1)}L
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
