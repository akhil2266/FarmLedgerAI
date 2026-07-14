import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Chip, CircularProgress, Menu, MenuItem as MItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { farmService } from '../../services/farmService';
import { SOIL_TYPES, IRRIGATION_TYPES, INDIAN_STATES } from '../../utils/constants';

const emptyForm = {
  farmName: '', farmSizeAcres: '', soilType: 'loamy', irrigationType: 'rainfed',
  state: '', district: '', village: '', pincode: '', latitude: '', longitude: '',
  phLevel: '', nitrogenLevel: '', phosphorusLevel: '', potassiumLevel: '',
};

const FarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [menuAnchor, setMenuAnchor] = useState({ el: null, farm: null });

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await farmService.list();
      setFarms(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (farm) => {
    setForm({
      farmName: farm.farm_name, farmSizeAcres: farm.farm_size_acres, soilType: farm.soil_type,
      irrigationType: farm.irrigation_type, state: farm.state, district: farm.district,
      village: farm.village || '', pincode: farm.pincode || '', latitude: farm.latitude || '',
      longitude: farm.longitude || '', phLevel: farm.ph_level || '', nitrogenLevel: farm.nitrogen_level || '',
      phosphorusLevel: farm.phosphorus_level || '', potassiumLevel: farm.potassium_level || '',
    });
    setEditingId(farm.id);
    setDialogOpen(true);
    setMenuAnchor({ el: null, farm: null });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await farmService.update(editingId, form);
        toast.success('Farm updated successfully');
      } else {
        await farmService.create(form);
        toast.success('Farm created successfully');
      }
      setDialogOpen(false);
      fetchFarms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save farm');
    }
  };

  const handleDelete = async (farm) => {
    if (!window.confirm(`Delete "${farm.farm_name}"? This cannot be undone.`)) return;
    try {
      await farmService.remove(farm.id);
      toast.success('Farm deleted');
      fetchFarms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete farm');
    }
    setMenuAnchor({ el: null, farm: null });
  };

  return (
    <Box>
      <PageHeader title="Farms" subtitle="Manage all your registered farms and their soil profiles." actionLabel="Add Farm" onAction={openCreate} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : farms.length === 0 ? (
        <Paper className="glass-panel" sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">No farms yet. Click "Add Farm" to get started.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {farms.map((farm, idx) => (
            <Grid item xs={12} sm={6} md={4} key={farm.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.05 }}>
                <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" fontWeight={700}>{farm.farm_name}</Typography>
                    <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, farm })}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.5 }}>
                    <LocationOnIcon fontSize="inherit" />
                    <Typography variant="body2">{farm.village ? `${farm.village}, ` : ''}{farm.district}, {farm.state}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    <Chip label={`${farm.farm_size_acres} acres`} size="small" />
                    <Chip label={farm.soil_type} size="small" color="primary" variant="outlined" />
                    <Chip label={farm.irrigation_type} size="small" color="info" variant="outlined" />
                  </Box>
                  {farm.ph_level && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      pH {farm.ph_level} · N {farm.nitrogen_level || '—'} · P {farm.phosphorus_level || '—'} · K {farm.potassium_level || '—'}
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={menuAnchor.el} open={Boolean(menuAnchor.el)} onClose={() => setMenuAnchor({ el: null, farm: null })}>
        <MItem onClick={() => openEdit(menuAnchor.farm)}><EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit</MItem>
        <MItem onClick={() => handleDelete(menuAnchor.farm)}><DeleteIcon fontSize="small" sx={{ mr: 1.5 }} color="error" /> Delete</MItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Farm' : 'Add New Farm'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Farm Name" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth required type="number" label="Size (acres)" value={form.farmSizeAcres} onChange={(e) => setForm({ ...form, farmSizeAcres: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Soil Type" value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })}>
                {SOIL_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Irrigation Type" value={form.irrigationType} onChange={(e) => setForm({ ...form, irrigationType: e.target.value })}>
                {IRRIGATION_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth required select label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth required label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Village" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} helperText="For weather integration" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth type="number" label="pH" value={form.phLevel} onChange={(e) => setForm({ ...form, phLevel: e.target.value })} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth type="number" label="N" value={form.nitrogenLevel} onChange={(e) => setForm({ ...form, nitrogenLevel: e.target.value })} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth type="number" label="P" value={form.phosphorusLevel} onChange={(e) => setForm({ ...form, phosphorusLevel: e.target.value })} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth type="number" label="K" value={form.potassiumLevel} onChange={(e) => setForm({ ...form, potassiumLevel: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create Farm'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmsPage;
