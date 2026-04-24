// src/pages/admin/Dashboard/components/UsersByRole.jsx

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Skeleton, Paper, Grid } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b35'];

// تعريف الأسماء العربية للأدوار
const roleLabels = {
  admin: 'مشرف',
  vendor: 'تاجر',
  driver: 'مندوب',
  client: 'عميل',
  super_admin: 'مشرف عام',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 1.5, bgcolor: 'background.paper' }}>
        <Typography variant="body2" fontWeight="bold">
          {data.name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          العدد: {data.value}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          النسبة: {data.percentage}%
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function UsersByRole({ data = [], loading = false }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Skeleton variant="circular" width={200} height={200} />
      </Box>
    );
  }
  
  // ✅ معالجة البيانات: تحويلها إلى مصفوفة إذا كانت كائناً
  let processedData = [];
  
  // إذا كانت data مصفوفة
  if (Array.isArray(data)) {
    processedData = data;
  } 
  // إذا كانت data كائناً يحتوي على byRole
  else if (data && typeof data === 'object') {
    // حالة 1: data = { byRole: [...] }
    if (data.byRole && Array.isArray(data.byRole)) {
      processedData = data.byRole;
    }
    // حالة 2: data = { data: { byRole: [...] } }
    else if (data.data && data.data.byRole && Array.isArray(data.data.byRole)) {
      processedData = data.data.byRole;
    }
    // حالة 3: data = { data: [...] }
    else if (data.data && Array.isArray(data.data)) {
      processedData = data.data;
    }
    // حالة 4: data = { role: 'client', count: 100 } (كائن واحد)
    else if (data.role !== undefined) {
      processedData = [data];
    }
  }
  
  // إذا كانت البيانات فارغة
  if (!processedData || processedData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">لا توجد بيانات</Typography>
      </Box>
    );
  }
  
  // حساب المجموع الكلي
  const total = processedData.reduce((sum, item) => sum + (item.count || item.value || 0), 0);
  
  // إعداد البيانات للرسم البياني
  const chartData = processedData.map((item, index) => {
    const role = item._id || item.role || item.name;
    const value = item.count || item.value || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    
    return {
      name: roleLabels[role] || role || 'أخرى',
      role: role,
      value: value,
      percentage: percentage,
      color: COLORS[index % COLORS.length],
    };
  }).filter(item => item.value > 0); // إزالة العناصر ذات القيمة صفر
  
  if (chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">لا توجد بيانات لعرضها</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => <Typography variant="caption">{value}</Typography>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* عرض إحصائيات إضافية */}
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {chartData.map((item) => (
          <Grid item xs={6} key={item.role}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                bgcolor: `${item.color}10`,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: item.color }}>
                {item.name}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {item.value} ({item.percentage}%)
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}