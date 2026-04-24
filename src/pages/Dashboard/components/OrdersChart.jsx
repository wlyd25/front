// src/pages/admin/Dashboard/components/OrdersChart.jsx

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ToggleButton, ToggleButtonGroup, Box, Typography } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="caption" sx={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function OrdersChart({ data = [], loading = false }) {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
  };

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) setTimeRange(newRange);
  };

  // فلترة البيانات حسب النطاق الزمني
  const getFilteredData = () => {
    if (!data.length) return [];
    
    const now = new Date();
    let daysToShow = 7;
    
    switch (timeRange) {
      case 'day':
        daysToShow = 1;
        break;
      case 'week':
        daysToShow = 7;
        break;
      case 'month':
        daysToShow = 30;
        break;
      case 'year':
        daysToShow = 365;
        break;
      default:
        daysToShow = 7;
    }
    
    // أخذ آخر N من الأيام
    return data.slice(-daysToShow);
  };

  const filteredData = getFilteredData();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={350}>
        <Typography color="textSecondary">جاري تحميل البيانات...</Typography>
      </Box>
    );
  }
  
  if (filteredData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={350}>
        <Typography color="textSecondary">لا توجد بيانات لعرضها</Typography>
      </Box>
    );
  }

  const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
  const ChartSeries = chartType === 'line' ? Line : chartType === 'area' ? Area : Bar;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="day">يوم</ToggleButton>
          <ToggleButton value="week">أسبوع</ToggleButton>
          <ToggleButton value="month">شهر</ToggleButton>
          <ToggleButton value="year">سنة</ToggleButton>
        </ToggleButtonGroup>
        
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="line">خطي</ToggleButton>
          <ToggleButton value="area">مساحي</ToggleButton>
          <ToggleButton value="bar">أعمدة</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ChartSeries
            type="monotone"
            dataKey="orders"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            name="الطلبات"
            barSize={30}
          />
          <ChartSeries
            type="monotone"
            dataKey="completed"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
            name="مكتملة"
            barSize={30}
          />
          <ChartSeries
            type="monotone"
            dataKey="cancelled"
            stroke="#ff8042"
            fill="#ff8042"
            fillOpacity={0.3}
            name="ملغية"
            barSize={30}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  );
}