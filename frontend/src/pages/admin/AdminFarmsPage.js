import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, TableContainer, TextField, MenuItem } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { adminService } from '../../services/aiService';
import { INDIAN_STATES } from '../../utils/constants';

const AdminFarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.allFarms({ state: state || undefined, limit: 50 });
      setFarms(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  return (
    <Box>
      <PageHeader title="All Farms" subtitle="Every farm registered on the platform.">
        <TextField select size="small" label="State" value={state} onChange={(e) => setState(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All States</MenuItem>
          {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </PageHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Farm Name</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Size (acres)</TableCell>
                  <TableCell>Soil Type</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {farms.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{f.farm_name}</TableCell>
                    <TableCell>{f.owner_name}</TableCell>
                    <TableCell>{f.farm_size_acres}</TableCell>
                    <TableCell><Chip size="small" label={f.soil_type} /></TableCell>
                    <TableCell>{f.district}, {f.state}</TableCell>
                  </TableRow>
                ))}
                {farms.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No farms found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AdminFarmsPage;
