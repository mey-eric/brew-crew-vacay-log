
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wine, Clock, TrendingDown, Users, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar';

type TimeRange = '24h' | '12h' | '6h';

const AlcoholTracking = () => {
  const { entries } = useBeer();
  const { currentUser, isAuthenticated, users } = useUser();
  const [timeRange, setTimeRange] = useState<TimeRange>('12h');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Calculate BAC based on alcohol consumed and time
  const calculateBAC = (alcoholGrams: number, timeElapsed: number, weight: number = 75, gender: 'male' | 'female' = 'male') => {
    const r = gender === 'male' ? 0.68 : 0.55;
    const initialBAC = (alcoholGrams / (weight * r)) * 10;
    const eliminationRate = 0.15;
    const eliminatedBAC = (timeElapsed / 60) * eliminationRate;
    const currentBAC = Math.max(0, initialBAC - eliminatedBAC);
    return currentBAC;
  };

  // Get date range based on selection
  const getDateRange = (): [Date, Date] => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '6h':
        startDate.setHours(endDate.getHours() - 6);
        break;
      case '12h':
        startDate.setHours(endDate.getHours() - 12);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
    }
    
    return [startDate, endDate];
  };

  // Prepare alcohol tracking data for a specific user
  const prepareUserAlcoholData = (userId: string) => {
    const [startDate, endDate] = getDateRange();
    const userEntries = entries
      .filter(entry => 
        entry.userId === userId &&
        new Date(entry.timestamp) >= startDate &&
        new Date(entry.timestamp) <= endDate
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (userEntries.length === 0) return [];

    const dataPoints: Array<{ time: string, bac: number, timestamp: number, userId: string, userName: string }> = [];
    const interval = 15;
    const totalMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    
    for (let i = 0; i <= totalMinutes; i += interval) {
      const currentTime = new Date(startDate.getTime() + i * 60 * 1000);
      let totalBAC = 0;
      
      userEntries.forEach(entry => {
        const drinkTime = new Date(entry.timestamp);
        if (drinkTime <= currentTime) {
          const timeElapsed = (currentTime.getTime() - drinkTime.getTime()) / (1000 * 60);
          const alcoholGrams = (entry.size / 1000) * (entry.alcohol_percentage || 5.0) * 0.8;
          const bac = calculateBAC(alcoholGrams, timeElapsed);
          totalBAC += bac;
        }
      });
      
      dataPoints.push({
        time: currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        bac: Number(totalBAC.toFixed(2)),
        timestamp: currentTime.getTime(),
        userId,
        userName: userEntries[0]?.userName || 'Unknown'
      });
    }
    
    return dataPoints;
  };

  // Get current user's BAC data
  const currentUserData = currentUser ? prepareUserAlcoholData(currentUser.id) : [];
  const currentBAC = currentUserData.length > 0 ? currentUserData[currentUserData.length - 1].bac : 0;
  
  // Estimate when BAC will reach 0
  const estimateZeroBAC = () => {
    if (currentBAC <= 0) return null;
    
    const hoursToZero = currentBAC / 0.15;
    const zeroTime = new Date(Date.now() + hoursToZero * 60 * 60 * 1000);
    return zeroTime;
  };

  const zeroTime = estimateZeroBAC();

  // Prepare comparison data for all users or selected user
  const prepareComparisonData = () => {
    if (selectedUserId === 'all') {
      // Show all users
      const allUserData: any[] = [];
      users.forEach(user => {
        const userData = prepareUserAlcoholData(user.id);
        userData.forEach(point => {
          allUserData.push({
            ...point,
            [`${user.name}_bac`]: point.bac
          });
        });
      });
      
      // Group by time
      const groupedData: Record<string, any> = {};
      allUserData.forEach(point => {
        const key = point.time;
        if (!groupedData[key]) {
          groupedData[key] = { time: key, timestamp: point.timestamp };
        }
        groupedData[key][`${point.userName}_bac`] = point.bac;
      });
      
      return Object.values(groupedData).sort((a: any, b: any) => a.timestamp - b.timestamp);
    } else {
      // Show selected user
      return prepareUserAlcoholData(selectedUserId);
    }
  };

  const comparisonData = prepareComparisonData();

  return (
    <div className="min-h-screen bg-beer-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-beer-dark">Alcohol Level Tracking</h1>
          <p className="text-sm md:text-base text-gray-600">Monitor your blood alcohol content and track when you'll be sober.</p>
        </header>
        
        {/* Current User BAC Overview */}
        <div className="mb-6">
          <Card className="border-beer-dark">
            <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
              <CardTitle className="flex items-center text-lg md:text-xl font-bold">
                <Wine className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Your Current Status
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 md:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-beer-cream p-3 md:p-4 rounded-lg border border-beer-dark">
                  <h3 className="text-xs md:text-sm font-medium text-beer-dark mb-1">Current BAC</h3>
                  <p className="text-xl md:text-2xl font-bold text-beer-red">{currentBAC.toFixed(2)}‰</p>
                </div>
                
                <div className="bg-beer-cream p-3 md:p-4 rounded-lg border border-beer-dark">
                  <h3 className="text-xs md:text-sm font-medium text-beer-dark mb-1">Status</h3>
                  <p className="text-sm md:text-lg font-semibold">
                    {currentBAC === 0 ? (
                      <span className="text-green-600">Sober</span>
                    ) : currentBAC < 0.5 ? (
                      <span className="text-yellow-600">Light</span>
                    ) : currentBAC < 1.0 ? (
                      <span className="text-orange-600">Moderate</span>
                    ) : (
                      <span className="text-red-600">High</span>
                    )}
                  </p>
                </div>
                
                <div className="bg-beer-cream p-3 md:p-4 rounded-lg border border-beer-dark">
                  <h3 className="text-xs md:text-sm font-medium text-beer-dark mb-1 flex items-center">
                    <TrendingDown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Zero BAC
                  </h3>
                  <div className="text-xs md:text-sm font-medium">
                    {zeroTime ? (
                      <div>
                        <div>{zeroTime.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                        <div className="text-beer-dark">
                          {zeroTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-green-600">Now</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[140px] border-beer-dark bg-white text-beer-dark">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Last 6h</SelectItem>
              <SelectItem value="12h">Last 12h</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full sm:w-[180px] border-beer-dark bg-white text-beer-dark">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alcohol Tracking Graph */}
        <Card className="border-beer-dark">
          <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
            <CardTitle className="flex items-center text-lg md:text-xl font-bold">
              <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              BAC Over Time
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 md:pt-6">
            <div className="h-[250px] md:h-[400px]">
              {comparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={comparisonData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 50,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      angle={-45}
                      textAnchor="end"
                      height={70} 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'BAC (‰)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 }
                      }} 
                      domain={[0, 'dataMax']}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${value}‰`, name.replace('_bac', '')]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <ReferenceLine y={0.5} stroke="#FFA500" strokeDasharray="5 5" label="0.5‰" />
                    <ReferenceLine y={1.0} stroke="#FF0000" strokeDasharray="5 5" label="1.0‰" />
                    
                    {selectedUserId === 'all' ? (
                      // Show lines for all users
                      users.map((user, index) => (
                        <Line 
                          key={user.id}
                          type="monotone" 
                          dataKey={`${user.name}_bac`} 
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                          connectNulls={false}
                        />
                      ))
                    ) : (
                      // Show single user line
                      <Line 
                        type="monotone" 
                        dataKey="bac" 
                        stroke="#B22222" 
                        strokeWidth={3}
                        dot={{ fill: '#B22222', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm md:text-base text-center px-4">
                    No alcohol consumption data available for the selected time range.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>* BAC calculations are estimates based on average metabolism rates.</p>
              <p>* Actual values may vary based on individual factors such as weight, gender, and metabolism.</p>
              <p>* Legal drinking limits and safety recommendations vary by country.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlcoholTracking;
