import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Button, Chip, CircularProgress, TableContainer,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { saleService, farmService, cropService } from '../../services/farmService';
import { PAYMENT_STATUSES } from '../../utils/constants';

const emptyForm = {
  farmId: '', cropId: '', buyerName: '', quantityKg: '', pricePerKg: '',
  marketName: '', saleDate: new Date().toISOString().slice(0, 10), paymentStatus: 'pending',
};

const STATUS_COLOR = { pending: 'warning', partial: 'info', paid: 'success' };

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [saleRes, farmRes, cropRes] = await Promise.all([saleService.list(), farmService.list(), cropService.list()]);
      setSales(saleRes.data.rows || []);
      setFarms(farmRes.data || []);
      setCrops(cropRes.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    if (farms.length === 0) { toast.error('Add a farm first.'); return; }
    setForm({ ...emptyForm, farmId: farms[0].id });
    setInvoiceFile(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      farmId: s.farm_id, cropId: s.crop_id || '', buyerName: s.buyer_name || '', quantityKg: s.quantity_kg,
      pricePerKg: s.price_per_kg, marketName: s.market_name || '', saleDate: s.sale_date, paymentStatus: s.payment_status,
    });
    setInvoiceFile(null);
    setEditingId(s.id);
    setDialogOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== undefined && v !== null) fd.append(k, v); });
    if (invoiceFile) fd.append('receipt', invoiceFile);
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const fd = buildFormData();
      if (editingId) {
        await saleService.update(editingId, fd);
        toast.success('Sale updated');
      } else {
        await saleService.create(fd);
        toast.success('Sale recorded');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save sale');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale?')) return;
    try {
      await saleService.remove(id);
      toast.success('Sale deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const farmCrops = crops.filter((c) => String(c.farm_id) === String(form.farmId));

  return (
    <Box>
      <PageHeader title="Sales" subtitle="Record every sale to track revenue and buyer payments." actionLabel="Add Sale" onAction={openCreate} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price/kg</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.sale_date}</TableCell>
                    <TableCell>{s.buyer_name || '—'}{s.invoice_url && <AttachFileIcon fontSize="inherit" sx={{ ml: 0.5, verticalAlign: 'middle' }} />}</TableCell>
                    <TableCell>{s.quantity_kg} kg</TableCell>
                    <TableCell>₹{s.price_per_kg}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{Number(s.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell><Chip size="small" label={s.payment_status} color={STATUS_COLOR[s.payment_status]} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No sales recorded yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Sale' : 'Add Sale'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 0.5 }}>
            <TextField select fullWidth label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value, cropId: '' })}>
              {farms.map((f) => <MenuItem key={f.id} value={f.id}>{f.farm_name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Crop (optional)" value={form.cropId} onChange={(e) => setForm({ ...form, cropId: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {farmCrops.map((c) => <MenuItem key={c.id} value={c.id}>{c.crop_name}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Buyer Name" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} />
            <TextField fullWidth label="Market Name" value={form.marketName} onChange={(e) => setForm({ ...form, marketName: e.target.value })} />
            <TextField fullWidth required type="number" label="Quantity (kg)" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
            <TextField fullWidth required type="number" label="Price per kg (₹)" value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} />
            <TextField fullWidth required type="date" label="Sale Date" InputLabelProps={{ shrink: true }} value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
            <TextField select fullWidth label="Payment Status" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
              {PAYMENT_STATUSES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <Button component="label" variant="outlined" startIcon={<AttachFileIcon />} sx={{ gridColumn: '1 / -1' }}>
              {invoiceFile ? invoiceFile.name : 'Attach Invoice (optional)'}
              <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setInvoiceFile(e.target.files[0])} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Add Sale'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesPage;
