
import React, { useState } from 'react';
import { ChartBar, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useBeer } from '@/contexts/BeerContext';
import { useUser } from '@/contexts/UserContext';

type TimeRange = '24h' | '7d' | '30d' | 'all';

const ConsumptionGraph = () => {
  const { entries, getUserEntries } = useBeer();
  const { users } = useUser();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');

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
        startDate.setFullYear(startDate.getFullYear() - 10); // Essentially "all" data
    }
    
    return [startDate, endDate];
  };

  // Filter data based on date range and selected user
  const getFilteredData = () => {
    const [startDate, endDate] = getDateRange();
    
    let filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (selectedUser !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.userId === selectedUser);
    }
    
    return filteredEntries;
  };

  // Prepare data for the chart - aggregate by day
  const prepareChartData = () => {
    const filteredData = getFilteredData();
    const aggregatedData: Record<string, Record<string, number>> = {};
    
    // Initialize date range
    const [startDate, endDate] = getDateRange();
    const dateIterator = new Date(startDate);
    
    while (dateIterator <= endDate) {
      const dateStr = dateIterator.toISOString().split('T')[0];
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
      
      // Move to next day
      dateIterator.setDate(dateIterator.getDate() + 1);
    }
    
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
    return Object.keys(aggregatedData)
      .sort()
      .map(date => ({
        date: date,
        ...aggregatedData[date]
      }));
  };

  const chartData = prepareChartData();
  const userColors = {
    John: "#F2A900",  // amber
    Jane: "#B22222",  // red
    Mike: "#442412",  // dark
    Sarah: "#2E8B57"  // sea green
  };
  
  return (
    <Card className="border-beer-dark">
      <CardHeader className="bg-beer-amber text-beer-dark rounded-t-md flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl font-bold">
          <ChartBar className="mr-2 h-5 w-5" />
          Beer Consumption
        </CardTitle>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[120px] border-beer-dark bg-beer-cream text-beer-dark">
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
            <SelectTrigger className="w-[160px] border-beer-dark bg-beer-cream text-beer-dark">
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
      
      <CardContent className="pt-6">
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Liters', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} L`, ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend 
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 10 }}
                />
                {(selectedUser === 'all' ? users : users.filter(u => u.id === selectedUser)).map((user) => (
                  <Bar 
                    key={user.id} 
                    dataKey={user.name} 
                    fill={userColors[user.name as keyof typeof userColors] || "#8884d8"} 
                    name={user.name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available for the selected time range.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsumptionGraph;
