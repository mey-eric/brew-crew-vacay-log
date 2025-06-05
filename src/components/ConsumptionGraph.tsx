
import React, { useState } from 'react';
import { ChartBar, Calendar, Filter, TrendingUp, Maximize2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

type TimeRange = '24h' | '7d' | '30d' | 'all';

interface ConsumptionGraphProps {
  isFullScreen?: boolean;
}

const ConsumptionGraph: React.FC<ConsumptionGraphProps> = ({ isFullScreen = false }) => {
  const { entries, getUserEntries } = useBeer();
  const { users } = useUser();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');

  console.log('ConsumptionGraph - entries:', entries);
  console.log('ConsumptionGraph - users:', users);
  console.log('ConsumptionGraph - timeRange:', timeRange);
  console.log('ConsumptionGraph - selectedUser:', selectedUser);

  // Generate consistent colors for each user
  const getUserColors = () => {
    const colors = [
      "#F2A900",  // amber
      "#B22222",  // red
      "#442412",  // dark brown
      "#2E8B57",  // sea green
      "#4169E1",  // royal blue
      "#FF6347",  // tomato
      "#32CD32",  // lime green
      "#9370DB",  // medium purple
      "#FF1493",  // deep pink
      "#00CED1"   // dark turquoise
    ];
    
    const userColors: Record<string, string> = {};
    users.forEach((user, index) => {
      userColors[user.name] = colors[index % colors.length];
    });
    
    return userColors;
  };

  const userColors = getUserColors();

  // Calculate date range based on selection
  const getDateRange = (): [Date, Date] => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'all':
      default:
        startDate.setFullYear(2020); // Go back far enough to capture all data
    }
    
    console.log('Date range:', { startDate, endDate, timeRange });
    return [startDate, endDate];
  };

  // Filter data based on date range and selected user
  const getFilteredData = () => {
    if (!entries || entries.length === 0) {
      console.log('No entries available');
      return [];
    }

    const [startDate, endDate] = getDateRange();
    
    let filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const inRange = entryDate >= startDate && entryDate <= endDate;
      console.log('Entry date check:', { 
        timestamp: entry.timestamp, 
        entryDate, 
        startDate, 
        endDate, 
        inRange 
      });
      return inRange;
    });
    
    if (selectedUser !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.userId === selectedUser);
    }
    
    console.log('Filtered entries:', filteredEntries);
    return filteredEntries;
  };

  // Prepare data for the bar chart - aggregate by day
  const prepareChartData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      console.log('No filtered data for chart');
      return [];
    }

    const aggregatedData: Record<string, Record<string, number>> = {};
    
    // First, process all entries to find actual date range
    const actualDates = filteredData.map(entry => new Date(entry.timestamp).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(actualDates)].sort();
    
    console.log('Unique dates in data:', uniqueDates);
    
    // Initialize with actual dates from data
    uniqueDates.forEach(dateStr => {
      aggregatedData[dateStr] = {};
      
      // Initialize with zero for each user
      if (selectedUser === 'all') {
        users.forEach(user => {
          aggregatedData[dateStr][user.name] = 0;
        });
      } else {
        const user = users.find(u => u.id === selectedUser);
        if (user) {
          aggregatedData[dateStr][user.name] = 0;
        }
      }
    });
    
    // Aggregate consumption data
    filteredData.forEach(entry => {
      const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
      if (aggregatedData[dateStr]) {
        if (!aggregatedData[dateStr][entry.userName]) {
          aggregatedData[dateStr][entry.userName] = 0;
        }
        aggregatedData[dateStr][entry.userName] += entry.size / 1000; // Convert to liters
      }
    });
    
    // Convert to array format for Recharts
    const chartData = Object.keys(aggregatedData)
      .sort()
      .map(date => ({
        date: date,
        ...aggregatedData[date]
      }));
    
    console.log('Chart data prepared:', chartData);
    return chartData;
  };

  // Prepare cumulative data for line chart
  const prepareCumulativeData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      console.log('No filtered data for cumulative chart');
      return [];
    }
    
    // Sort all entries by timestamp
    const sortedEntries = filteredData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Track cumulative consumption for each user
    const userCumulatives: Record<string, number> = {};
    
    // Initialize cumulative values for relevant users
    if (selectedUser === 'all') {
      users.forEach(user => {
        userCumulatives[user.name] = 0;
      });
    } else {
      const user = users.find(u => u.id === selectedUser);
      if (user) {
        userCumulatives[user.name] = 0;
      }
    }
    
    const cumulativeData: Array<{ timestamp: string, date: string, time: string, [key: string]: any }> = [];
    
    sortedEntries.forEach(entry => {
      userCumulatives[entry.userName] = (userCumulatives[entry.userName] || 0) + (entry.size / 1000); // Convert to liters
      
      const entryDate = new Date(entry.timestamp);
      cumulativeData.push({
        timestamp: entry.timestamp,
        date: entryDate.toLocaleDateString(),
        time: entryDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        ...Object.fromEntries(
          Object.keys(userCumulatives).map(userName => [`${userName}_cumulative`, userCumulatives[userName]])
        )
      });
    });
    
    console.log('Cumulative data prepared:', cumulativeData);
    return cumulativeData;
  };

  const chartData = prepareChartData();
  const cumulativeData = prepareCumulativeData();
  
  const handleFullScreenClick = () => {
    navigate('/beer-consumption');
  };

  const chartHeight = isFullScreen ? 500 : 250;
  const responsiveHeight = isFullScreen ? chartHeight : `${chartHeight}px md:${chartHeight + 50}px`;
  
  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center text-lg md:text-xl font-bold">
            <ChartBar className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Beer Consumption
          </CardTitle>
          
          {!isFullScreen && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFullScreenClick}
              className="bg-beer-cream hover:bg-beer-light border-beer-dark text-beer-dark"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              View Full Screen
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[120px] border-beer-dark bg-beer-cream text-beer-dark">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-full sm:w-[160px] border-beer-dark bg-beer-cream text-beer-dark">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 md:pt-6">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="daily" className="flex items-center">
              <ChartBar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Daily</span>
            </TabsTrigger>
            <TabsTrigger value="cumulative" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Cumulative</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <div className={`h-[${responsiveHeight}]`}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: isFullScreen ? 50 : 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={isFullScreen ? 90 : 70} 
                      tick={{ fontSize: isFullScreen ? 12 : 10 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Liters', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: isFullScreen ? 14 : 12 }
                      }} 
                      tick={{ fontSize: isFullScreen ? 12 : 10 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} L`, ""]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend 
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: 10, fontSize: isFullScreen ? 14 : 12 }}
                    />
                    {(selectedUser === 'all' ? users : users.filter(u => u.id === selectedUser)).map((user) => (
                      <Bar 
                        key={user.id} 
                        dataKey={user.name} 
                        fill={userColors[user.name]} 
                        name={user.name}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm text-center px-4">No data available for the selected time range.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="cumulative">
            <div className={`h-[${responsiveHeight}]`}>
              {cumulativeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={cumulativeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: isFullScreen ? 50 : 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="time"
                      angle={-45}
                      textAnchor="end"
                      height={isFullScreen ? 90 : 70} 
                      tick={{ fontSize: isFullScreen ? 12 : 10 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Total Liters', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: isFullScreen ? 14 : 12 }
                      }} 
                      tick={{ fontSize: isFullScreen ? 12 : 10 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${Number(value).toFixed(2)} L`, String(name).replace('_cumulative', '')]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Legend 
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: 10, fontSize: isFullScreen ? 14 : 12 }}
                    />
                    {(selectedUser === 'all' ? users : users.filter(u => u.id === selectedUser)).map((user, index) => (
                      <Line 
                        key={user.id}
                        type="monotone" 
                        dataKey={`${user.name}_cumulative`} 
                        stroke={userColors[user.name]}
                        strokeWidth={isFullScreen ? 3 : 2}
                        dot={{ r: isFullScreen ? 3 : 2 }}
                        activeDot={{ r: isFullScreen ? 5 : 4 }}
                        name={user.name}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm text-center px-4">No cumulative data available for the selected time range.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsumptionGraph;
