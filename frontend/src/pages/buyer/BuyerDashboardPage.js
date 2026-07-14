import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, Chip, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaidIcon from '@mui/icons-material/Paid';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { motion } from 'framer-motion';
import KpiCard from '../../components/common/KpiCard';
import PageHeader from '../../components/common/PageHeader';
import { marketplaceService } from '../../services/aiService';

const ORDER_STATUS_COLOR = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };

const BuyerDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.myOrders({ limit: 50 });
      setOrders(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <Box>
      <PageHeader title="Buyer Dashboard" subtitle="Track your orders and spending across the marketplace." />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <KpiCard index={0} title="Total Spent" value={totalSpent} format="currency" icon={<PaidIcon color="success" />} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard index={1} title="Orders in Progress" value={pendingCount} icon={<LocalShippingIcon color="warning" />} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard index={2} title="Orders Delivered" value={deliveredCount} icon={<ShoppingCartIcon color="primary" />} />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Orders</Typography>
          <Grid container spacing={2.5}>
            {orders.slice(0, 9).map((o, idx) => (
              <Grid item xs={12} sm={6} md={4} key={o.id}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={700}>{o.crop_name}</Typography>
                      <Chip size="small" label={o.status} color={ORDER_STATUS_COLOR[o.status]} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">from {o.farmer_name}</Typography>
                    <Typography variant="body2">{o.quantity_kg} kg — ₹{Number(o.total_amount).toLocaleString('en-IN')}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
            {orders.length === 0 && (
              <Grid item xs={12}>
                <Paper className="glass-panel" sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
                  <StorefrontIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">No orders yet. Browse listings to get started.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default BuyerDashboardPage;
