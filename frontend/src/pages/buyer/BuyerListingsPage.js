import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, TextField, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { marketplaceService } from '../../services/aiService';
import { INDIAN_STATES } from '../../utils/constants';

const BuyerListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropName, setCropName] = useState('');
  const [state, setState] = useState('');
  const [orderDialog, setOrderDialog] = useState({ open: false, listing: null });
  const [orderForm, setOrderForm] = useState({ quantityKg: '', deliveryAddress: '' });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.browseListings({ cropName: cropName || undefined, state: state || undefined, limit: 30 });
      setListings(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, [cropName, state]);

  useEffect(() => {
    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const openOrderDialog = (listing) => {
    setOrderForm({ quantityKg: listing.quantity_kg, deliveryAddress: '' });
    setOrderDialog({ open: true, listing });
  };

  const handlePlaceOrder = async () => {
    try {
      await marketplaceService.placeOrder({
        listingId: orderDialog.listing.id, quantityKg: orderForm.quantityKg, deliveryAddress: orderForm.deliveryAddress,
      });
      toast.success('Order placed successfully!');
      setOrderDialog({ open: false, listing: null });
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <Box>
      <PageHeader title="Browse Listings" subtitle="Discover fresh produce listed directly by farmers.">
        <TextField
          size="small" placeholder="Search crop..." value={cropName} onChange={(e) => setCropName(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="State" value={state} onChange={(e) => setState(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All States</MenuItem>
          {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </PageHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2.5}>
          {listings.map((l, idx) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>{l.crop_name}</Typography>
                    <Chip size="small" label={`Grade ${l.quality_grade}`} color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">by {l.farmer_name}</Typography>
                  <Typography variant="body2">{l.quantity_kg} kg available</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 1 }}>₹{l.asking_price_per_kg}/kg</Typography>
                  <Typography variant="caption" color="text.secondary">{l.district}, {l.state}</Typography>
                  <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => openOrderDialog(l)}>Place Order</Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
          {listings.length === 0 && (
            <Grid item xs={12}><Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>No listings match your filters.</Typography></Grid>
          )}
        </Grid>
      )}

      <Dialog open={orderDialog.open} onClose={() => setOrderDialog({ open: false, listing: null })} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Order {orderDialog.listing?.crop_name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth type="number" label="Quantity (kg)" sx={{ mt: 1, mb: 2 }}
            value={orderForm.quantityKg} onChange={(e) => setOrderForm({ ...orderForm, quantityKg: e.target.value })}
            helperText={`Max available: ${orderDialog.listing?.quantity_kg} kg`}
          />
          <TextField
            fullWidth multiline rows={2} label="Delivery Address"
            value={orderForm.deliveryAddress} onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
          />
          {orderDialog.listing && (
            <Typography variant="body2" sx={{ mt: 2 }} fontWeight={600}>
              Estimated Total: ₹{(Number(orderForm.quantityKg || 0) * Number(orderDialog.listing.asking_price_per_kg)).toLocaleString('en-IN')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOrderDialog({ open: false, listing: null })}>Cancel</Button>
          <Button variant="contained" onClick={handlePlaceOrder}>Confirm Order</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerListingsPage;
