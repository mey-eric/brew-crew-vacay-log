
import React, { useState } from 'react';
import { Wine, Clock, TrendingDown, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

type TimeRange = '24h' | '12h' | '6h';

const AlcoholTrackingGraph = () => {
  const { entries } = useBeer();
  const { currentUser } = useUser();
  const [timeRange, setTimeRange] = useState<TimeRange>('12h');
  const navigate = useNavigate();

  // Calculate BAC based on alcohol consumed and time
  const calculateBAC = (alcoholGrams: number, timeElapsed: number, weight: number = 75, gender: 'male' | 'female' = 'male') => {
    // Widmark formula for BAC calculation
    const r = gender === 'male' ? 0.68 : 0.55; // Distribution factor
    const initialBAC = (alcoholGrams / (weight * r)) * 10; // BAC in per mille
    
    // Alcohol elimination rate: approximately 0.15‰ per hour
    const eliminationRate = 0.15;
    const eliminatedBAC = (timeElapsed / 60) * eliminationRate; // timeElapsed in minutes
    
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

  // Prepare alcohol tracking data
  const prepareAlcoholData = () => {
    if (!currentUser) return [];
    
    const [startDate, endDate] = getDateRange();
    const userEntries = entries
      .filter(entry => 
        entry.userId === currentUser.id &&
        new Date(entry.timestamp) >= startDate &&
        new Date(entry.timestamp) <= endDate
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (userEntries.length === 0) return [];

    const dataPoints: Array<{ time: string, bac: number, timestamp: number }> = [];
    const now = new Date();
    
    // Create time points every 15 minutes
    const interval = 15; // minutes
    const totalMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    
    for (let i = 0; i <= totalMinutes; i += interval) {
      const currentTime = new Date(startDate.getTime() + i * 60 * 1000);
      let totalBAC = 0;
      
      // Calculate cumulative BAC from all previous drinks
      userEntries.forEach(entry => {
        const drinkTime = new Date(entry.timestamp);
        if (drinkTime <= currentTime) {
          const timeElapsed = (currentTime.getTime() - drinkTime.getTime()) / (1000 * 60); // in minutes
          const alcoholGrams = (entry.size / 1000) * (entry.alcohol_percentage || 5.0) * 0.8; // 0.8 is alcohol density
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
        timestamp: currentTime.getTime()
      });
    }
    
    return dataPoints;
  };

  const alcoholData = prepareAlcoholData();
  const currentBAC = alcoholData.length > 0 ? alcoholData[alcoholData.length - 1].bac : 0;
  
  // Estimate when BAC will reach 0
  const estimateZeroBAC = () => {
    if (currentBAC <= 0) return null;
    
    const hoursToZero = currentBAC / 0.15; // 0.15‰ per hour elimination
    const zeroTime = new Date(Date.now() + hoursToZero * 60 * 60 * 1000);
    return zeroTime;
  };

  const zeroTime = estimateZeroBAC();

  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <CardTitle className="flex items-center text-lg md:text-xl font-bold">
          <Wine className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Alcohol Level Tracking
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[100px] border-beer-dark bg-beer-cream text-beer-dark text-xs">
              <Clock className="mr-1 h-3 w-3" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="12h">12h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/alcohol-tracking')}
            className="border-beer-dark text-beer-dark hover:bg-beer-cream text-xs"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            View Full
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 md:pt-6">
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-beer-cream p-3 rounded-lg border border-beer-dark">
            <h3 className="text-xs font-medium text-beer-dark mb-1">Current BAC</h3>
            <p className="text-lg md:text-2xl font-bold text-beer-red">{currentBAC.toFixed(2)}‰</p>
          </div>
          
          <div className="bg-beer-cream p-3 rounded-lg border border-beer-dark">
            <h3 className="text-xs font-medium text-beer-dark mb-1">Status</h3>
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
          
          <div className="bg-beer-cream p-3 rounded-lg border border-beer-dark">
            <h3 className="text-xs font-medium text-beer-dark mb-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              Zero BAC
            </h3>
            <div className="text-xs font-medium">
              {zeroTime ? (
                <div>
                  <div>{zeroTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: zeroTime.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
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
        
        <div className="h-[200px] md:h-[300px]">
          {alcoholData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={alcoholData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  angle={-45}
                  textAnchor="end"
                  height={50} 
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  label={{ 
                    value: 'BAC (‰)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 10 }
                  }} 
                  domain={[0, 'dataMax']}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}‰`, "BAC"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <ReferenceLine y={0.5} stroke="#FFA500" strokeDasharray="5 5" label={{ value: "0.5‰", fontSize: 10 }} />
                <ReferenceLine y={1.0} stroke="#FF0000" strokeDasharray="5 5" label={{ value: "1.0‰", fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="bac" 
                  stroke="#B22222" 
                  strokeWidth={2}
                  dot={{ fill: '#B22222', strokeWidth: 1, r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-xs md:text-sm text-center px-4">No alcohol consumption data available for the selected time range.</p>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>* BAC calculations are estimates. Actual values may vary based on individual factors.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlcoholTrackingGraph;
