import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tabs, Tab, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { marketplaceService } from '../../services/aiService';
import { CROP_NAMES, QUALITY_GRADES, INDIAN_STATES } from '../../utils/constants';

const emptyForm = {
  cropName: '', quantityKg: '', askingPricePerKg: '', qualityGrade: 'A',
  availableFrom: new Date().toISOString().slice(0, 10), state: '', district: '',
};

const LISTING_STATUS_COLOR = { active: 'success', sold: 'default', expired: 'warning', cancelled: 'error' };
const ORDER_STATUS_COLOR = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };

const MarketplacePage = () => {
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, orderRes] = await Promise.all([marketplaceService.myListings(), marketplaceService.incomingOrders()]);
      setListings(listRes.data || []);
      setOrders(orderRes.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    try {
      await marketplaceService.createListing(form);
      toast.success('Listing published to the marketplace');
      setDialogOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const handleStatusChange = async (id, status) => {
    await marketplaceService.updateListingStatus(id, status);
    fetchData();
  };

  const handleOrderStatusChange = async (id, status) => {
    await marketplaceService.updateOrderStatus(id, status);
    toast.success('Order status updated');
    fetchData();
  };

  return (
    <Box>
      <PageHeader title="Marketplace" subtitle="Sell directly to buyers and manage incoming orders." actionLabel="New Listing" onAction={() => setDialogOpen(true)} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`My Listings (${listings.length})`} />
        <Tab label={`Incoming Orders (${orders.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : tab === 0 ? (
        <Grid container spacing={2.5}>
          {listings.map((l, idx) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>{l.crop_name}</Typography>
                    <Chip size="small" label={l.status} color={LISTING_STATUS_COLOR[l.status]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{l.quantity_kg} kg · Grade {l.quality_grade} · ₹{l.asking_price_per_kg}/kg</Typography>
                  <Typography variant="caption" color="text.secondary">{l.district}, {l.state}</Typography>
                  {l.status === 'active' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={() => handleStatusChange(l.id, 'cancelled')}>Cancel</Button>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          ))}
          {listings.length === 0 && <Grid item xs={12}><Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>No listings yet.</Typography></Grid>}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          {orders.map((o, idx) => (
            <Grid item xs={12} sm={6} key={o.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight={700}>{o.crop_name} — {o.quantity_kg} kg</Typography>
                    <Chip size="small" label={o.status} color={ORDER_STATUS_COLOR[o.status]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Buyer: {o.buyer_name}</Typography>
                  <Typography variant="body2" fontWeight={600}>Total: ₹{Number(o.total_amount).toLocaleString('en-IN')}</Typography>
                  {['pending', 'confirmed', 'shipped'].includes(o.status) && (
                    <TextField
                      select size="small" label="Update Status" value={o.status} sx={{ mt: 1.5, minWidth: 160 }}
                      onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          ))}
          {orders.length === 0 && <Grid item xs={12}><Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>No incoming orders yet.</Typography></Grid>}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Create Marketplace Listing</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 0.5 }}>
            <TextField select fullWidth label="Crop" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })}>
              {CROP_NAMES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Quality Grade" value={form.qualityGrade} onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}>
              {QUALITY_GRADES.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
            <TextField fullWidth type="number" label="Quantity (kg)" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
            <TextField fullWidth type="number" label="Asking Price (₹/kg)" value={form.askingPricePerKg} onChange={(e) => setForm({ ...form, askingPricePerKg: e.target.value })} />
            <TextField fullWidth type="date" label="Available From" InputLabelProps={{ shrink: true }} value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
            <TextField select fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} sx={{ gridColumn: '1 / -1' }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>Publish Listing</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplacePage;
