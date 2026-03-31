import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

export default function OrdersChart({ data = [] }) {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
  };

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) setTimeRange(newRange);
  };

  const ChartComponent = chartType === 'line' ? LineChart : AreaChart;
  const ChartLine = chartType === 'line' ? Line : Area;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
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
        </ToggleButtonGroup>
      </Box>
      
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ChartLine
            type="monotone"
            dataKey="orders"
            stroke="#8884d8"
            fill="#8884d8"
            name="الطلبات"
          />
          <ChartLine
            type="monotone"
            dataKey="completed"
            stroke="#82ca9d"
            fill="#82ca9d"
            name="مكتملة"
          />
          <ChartLine
            type="monotone"
            dataKey="cancelled"
            stroke="#ff8042"
            fill="#ff8042"
            name="ملغية"
          />
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  );
}