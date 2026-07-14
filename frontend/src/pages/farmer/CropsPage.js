import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Button, Chip, CircularProgress, TableContainer,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { cropService, farmService } from '../../services/farmService';
import { SEASONS, CROP_STATUSES, CROP_NAMES } from '../../utils/constants';

const emptyForm = {
  farmId: '', cropName: '', variety: '', season: 'kharif', areaAcres: '',
  sowingDate: '', expectedHarvestDate: '', expectedYieldKg: '', status: 'planned',
};

const STATUS_COLOR = { planned: 'default', sowing: 'info', growing: 'primary', harvested: 'success', failed: 'error' };

const CropsPage = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cropsRes, farmsRes] = await Promise.all([cropService.list(), farmService.list()]);
      setCrops(cropsRes.data.rows || []);
      setFarms(farmsRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    if (farms.length === 0) { toast.error('Add a farm first before creating a crop cycle.'); return; }
    setForm({ ...emptyForm, farmId: farms[0].id });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (crop) => {
    setForm({
      farmId: crop.farm_id, cropName: crop.crop_name, variety: crop.variety || '', season: crop.season,
      areaAcres: crop.area_acres, sowingDate: crop.sowing_date, expectedHarvestDate: crop.expected_harvest_date || '',
      expectedYieldKg: crop.expected_yield_kg || '', status: crop.status,
      actualHarvestDate: crop.actual_harvest_date || '', actualYieldKg: crop.actual_yield_kg || '',
    });
    setEditingId(crop.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await cropService.update(editingId, form);
        toast.success('Crop cycle updated');
      } else {
        await cropService.create(form);
        toast.success('Crop cycle created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save crop');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crop cycle?')) return;
    try {
      await cropService.remove(id);
      toast.success('Crop cycle deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <Box>
      <PageHeader title="Crops" subtitle="Track every planting cycle from sowing to harvest." actionLabel="Add Crop Cycle" onAction={openCreate} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Crop</TableCell>
                  <TableCell>Farm</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Area (acres)</TableCell>
                  <TableCell>Sowing Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {crops.map((crop) => (
                  <TableRow key={crop.id} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 600 }}>{crop.crop_name}</Box>
                      {crop.variety && <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{crop.variety}</Box>}
                    </TableCell>
                    <TableCell>{crop.farm_name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{crop.season}</TableCell>
                    <TableCell>{crop.area_acres}</TableCell>
                    <TableCell>{crop.sowing_date}</TableCell>
                    <TableCell><Chip size="small" label={crop.status} color={STATUS_COLOR[crop.status]} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(crop)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(crop.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {crops.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No crop cycles yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Crop Cycle' : 'Add Crop Cycle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 0.5 }}>
            <TextField select fullWidth label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })} sx={{ gridColumn: '1 / -1' }}>
              {farms.map((f) => <MenuItem key={f.id} value={f.id}>{f.farm_name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth required label="Crop Name" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })}>
              {CROP_NAMES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Variety" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} />
            <TextField select fullWidth label="Season" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
              {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField fullWidth required type="number" label="Area (acres)" value={form.areaAcres} onChange={(e) => setForm({ ...form, areaAcres: e.target.value })} />
            <TextField fullWidth required type="date" label="Sowing Date" InputLabelProps={{ shrink: true }} value={form.sowingDate} onChange={(e) => setForm({ ...form, sowingDate: e.target.value })} />
            <TextField fullWidth type="date" label="Expected Harvest" InputLabelProps={{ shrink: true }} value={form.expectedHarvestDate} onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })} />
            <TextField fullWidth type="number" label="Expected Yield (kg)" value={form.expectedYieldKg} onChange={(e) => setForm({ ...form, expectedYieldKg: e.target.value })} />
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {CROP_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            {editingId && (form.status === 'harvested') && (
              <>
                <TextField fullWidth type="date" label="Actual Harvest Date" InputLabelProps={{ shrink: true }} value={form.actualHarvestDate || ''} onChange={(e) => setForm({ ...form, actualHarvestDate: e.target.value })} />
                <TextField fullWidth type="number" label="Actual Yield (kg)" value={form.actualYieldKg || ''} onChange={(e) => setForm({ ...form, actualYieldKg: e.target.value })} />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CropsPage;
