import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PercentIcon from '@mui/icons-material/Percent';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import KpiCard from '../../components/common/KpiCard';
import PageHeader from '../../components/common/PageHeader';
import { dashboardService } from '../../services/farmService';

const COLORS = ['#2E7D32', '#66BB6A', '#F9A825', '#039BE5', '#8E24AA', '#E53935', '#00897B', '#FB8C00', '#5E35B1', '#3949AB', '#00ACC1', '#7CB342'];

const ChartCard = ({ title, children, height = 320, action, index = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
    <Paper className="glass-panel" elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {action}
      </Box>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  </motion.div>
);

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [investmentTrend, setInvestmentTrend] = useState([]);
  const [profitTrend, setProfitTrend] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [cropWiseProfit, setCropWiseProfit] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [revenueRange, setRevenueRange] = useState('monthly');
  const [roiAnalysis, setRoiAnalysis] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, inv, profit, breakdown, cropProfit, rev, roi] = await Promise.all([
        dashboardService.overview(),
        dashboardService.investmentTrend(12),
        dashboardService.profitTrend(12),
        dashboardService.expenseBreakdown(),
        dashboardService.cropWiseProfit(),
        dashboardService.revenue(revenueRange),
        dashboardService.roiAnalysis(),
      ]);
      setOverview(ov.data);
      setInvestmentTrend(inv.data);
      setProfitTrend(profit.data);
      setExpenseBreakdown(breakdown.data);
      setCropWiseProfit(cropProfit.data);
      setRevenue(rev.data);
      setRoiAnalysis(roi.data);
    } finally {
      setLoading(false);
    }
  }, [revenueRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading && !overview) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Your complete farm financial overview, powered by live data." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={0} title="Total Investment" value={overview?.totalInvestment} format="currency" icon={<AccountBalanceWalletIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={1} title="Total Revenue" value={overview?.totalRevenue} format="currency" icon={<PaidIcon color="success" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={2} title="Net Profit" value={overview?.netProfit} format="currency" icon={<TrendingUpIcon color="secondary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard index={3} title="ROI" value={overview?.roiPercent} format="percent" icon={<PercentIcon color="info" />} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <ChartCard title="Investment Trend (12 months)" index={0}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investmentTrend}>
                <defs>
                  <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="investment" stroke="#2E7D32" fill="url(#investGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <ChartCard title="Expense Breakdown by Category" index={1}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {expenseBreakdown.map((entry, idx) => <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <ChartCard title="Profit Trend (Revenue vs Expense vs Profit)" index={2}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#039BE5" fill="#039BE5" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#E53935" fill="#E53935" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <ChartCard title="Crop-wise Profit" index={3}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropWiseProfit} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="crop_name" fontSize={12} width={80} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
                  {cropWiseProfit.map((entry, idx) => (
                    <Cell key={entry.crop_name} fill={Number(entry.profit) >= 0 ? '#2E7D32' : '#E53935'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <ChartCard
            title={`${revenueRange === 'yearly' ? 'Yearly' : 'Monthly'} Revenue`}
            index={4}
            action={
              <ToggleButtonGroup size="small" exclusive value={revenueRange} onChange={(e, v) => v && setRevenueRange(v)}>
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#66BB6A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <ChartCard title="ROI Analysis by Crop Cycle" index={5}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="investment" name="Investment" fontSize={12} unit="₹" />
                <YAxis type="number" dataKey="roi_percent" name="ROI %" fontSize={12} unit="%" />
                <ZAxis type="number" dataKey="profit" range={[60, 300]} name="Profit" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v) => Number(v).toLocaleString('en-IN')} />
                <Scatter name="Crop Cycles" data={roiAnalysis} fill="#8E24AA" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
