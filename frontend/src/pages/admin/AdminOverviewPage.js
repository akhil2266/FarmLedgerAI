import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import PaidIcon from '@mui/icons-material/Paid';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import KpiCard from '../../components/common/KpiCard';
import PageHeader from '../../components/common/PageHeader';
import { adminService } from '../../services/aiService';

const AdminOverviewPage = () => {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, gr] = await Promise.all([adminService.overview(), adminService.growthTrend(12)]);
      setOverview(ov.data);
      setGrowth(gr.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !overview) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <PageHeader title="Platform Overview" subtitle="Real-time metrics across all farmers, buyers, and marketplace activity." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={0} title="Total Users" value={overview.users.totalUsers} icon={<PeopleIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={1} title="Total Farms" value={overview.farms.totalFarms} icon={<AgricultureIcon color="success" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={2} title="Total Crop Cycles" value={overview.crops.totalCrops} icon={<GrassIcon color="secondary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={3} title="Platform GMV" value={overview.marketplace.totalOrderValue} format="currency" icon={<PaidIcon color="info" />} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Platform Growth (New Users / Month)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>User Breakdown</Typography>
            {[
              ['Farmers', overview.users.farmers], ['Buyers', overview.users.buyers], ['Admins', overview.users.admins],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography color="text.secondary">{label}</Typography>
                <Typography fontWeight={700}>{value}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
              <Typography color="text.secondary">Platform Revenue</Typography>
              <Typography fontWeight={700}>₹{Number(overview.financials.platformRevenue).toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Total Acres Managed</Typography>
              <Typography fontWeight={700}>{Number(overview.farms.totalAcres).toLocaleString('en-IN')}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverviewPage;
