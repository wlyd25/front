// src/pages/admin/Dashboard/components/RevenueChart.jsx

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';

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
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#8884d8' }}>
          الإيرادات: {formatCurrency(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function RevenueChart({ data = [], loading = false }) {
  const theme = useTheme();
  const [chartType, setChartType] = useState('area');
  
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">جاري تحميل البيانات...</Typography>
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">لا توجد بيانات</Typography>
      </Box>
    );
  }
  
  // تنسيق البيانات
  const formattedData = data.map(item => ({
    ...item,
    revenue: item.revenue || 0,
  }));
  
  const getChartComponent = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => formatCurrency(value, '')} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="الإيرادات"
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => formatCurrency(value, '')} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              name="الإيرادات"
            />
          </BarChart>
        );
      default:
        return (
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => formatCurrency(value, '')} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              name="الإيرادات"
            />
          </AreaChart>
        );
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="area">مساحي</ToggleButton>
          <ToggleButton value="line">خطي</ToggleButton>
          <ToggleButton value="bar">أعمدة</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <ResponsiveContainer width="100%" height={260}>
        {getChartComponent()}
      </ResponsiveContainer>
    </Box>
  );
}