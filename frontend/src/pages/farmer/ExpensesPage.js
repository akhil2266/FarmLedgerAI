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
import { expenseService, farmService, cropService } from '../../services/farmService';
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../../utils/constants';

const emptyForm = {
  farmId: '', cropId: '', category: 'seeds', description: '', amount: '', quantity: '',
  unit: '', vendorName: '', paymentMode: 'cash', expenseDate: new Date().toISOString().slice(0, 10),
};

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [receiptFile, setReceiptFile] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, farmRes, cropRes] = await Promise.all([expenseService.list(), farmService.list(), cropService.list()]);
      setExpenses(expRes.data.rows || []);
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
    setReceiptFile(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (e) => {
    setForm({
      farmId: e.farm_id, cropId: e.crop_id || '', category: e.category, description: e.description || '',
      amount: e.amount, quantity: e.quantity || '', unit: e.unit || '', vendorName: e.vendor_name || '',
      paymentMode: e.payment_mode, expenseDate: e.expense_date,
    });
    setReceiptFile(null);
    setEditingId(e.id);
    setDialogOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== undefined && v !== null) fd.append(k, v); });
    if (receiptFile) fd.append('receipt', receiptFile);
    return fd;
  };

  const handleSubmit = async () => {
    try {
      const fd = buildFormData();
      if (editingId) {
        await expenseService.update(editingId, fd);
        toast.success('Expense updated');
      } else {
        await expenseService.create(fd);
        toast.success('Expense recorded');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseService.remove(id);
      toast.success('Expense deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const farmCrops = crops.filter((c) => String(c.farm_id) === String(form.farmId));

  return (
    <Box>
      <PageHeader title="Expenses" subtitle="Log every input cost across your farms and crops." actionLabel="Add Expense" onAction={openCreate} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.expense_date}</TableCell>
                    <TableCell><Chip size="small" label={e.category.replace('_', ' ')} /></TableCell>
                    <TableCell>
                      {e.description || '—'}
                      {e.receipt_url && <AttachFileIcon fontSize="inherit" sx={{ ml: 0.5, verticalAlign: 'middle' }} />}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{Number(e.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{e.payment_mode.replace('_', ' ')}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(e)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(e.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No expenses recorded yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 0.5 }}>
            <TextField select fullWidth label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value, cropId: '' })}>
              {farms.map((f) => <MenuItem key={f.id} value={f.id}>{f.farm_name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Crop (optional)" value={form.cropId} onChange={(e) => setForm({ ...form, cropId: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {farmCrops.map((c) => <MenuItem key={c.id} value={c.id}>{c.crop_name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>)}
            </TextField>
            <TextField fullWidth required type="number" label="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ gridColumn: '1 / -1' }} />
            <TextField fullWidth type="number" label="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <TextField fullWidth label="Unit (kg, litre, etc.)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <TextField fullWidth label="Vendor Name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
            <TextField select fullWidth label="Payment Mode" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
              {PAYMENT_MODES.map((p) => <MenuItem key={p} value={p}>{p.replace('_', ' ')}</MenuItem>)}
            </TextField>
            <TextField fullWidth required type="date" label="Expense Date" InputLabelProps={{ shrink: true }} value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
            <Button component="label" variant="outlined" startIcon={<AttachFileIcon />} sx={{ gridColumn: '1 / -1' }}>
              {receiptFile ? receiptFile.name : 'Attach Receipt (optional)'}
              <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files[0])} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Add Expense'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpensesPage;
