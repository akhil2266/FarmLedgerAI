import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Button, TableContainer } from '@mui/material';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { marketplaceService } from '../../services/aiService';

const ORDER_STATUS_COLOR = { pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' };

const BuyerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.myOrders({ limit: 100 });
      setOrders(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await marketplaceService.updateOrderStatus(id, 'cancelled');
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <Box>
      <PageHeader title="My Orders" subtitle="Track the status of every order you've placed." />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Crop</TableCell>
                  <TableCell>Farmer</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ordered On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{o.crop_name}</TableCell>
                    <TableCell>{o.farmer_name}</TableCell>
                    <TableCell>{o.quantity_kg} kg</TableCell>
                    <TableCell>₹{Number(o.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell><Chip size="small" label={o.status} color={ORDER_STATUS_COLOR[o.status]} /></TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell align="right">
                      {o.status === 'pending' && (
                        <Button size="small" color="error" onClick={() => handleCancel(o.id)}>Cancel</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No orders yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default BuyerOrdersPage;
