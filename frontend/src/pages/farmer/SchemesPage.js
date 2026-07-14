import React, { useEffect, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, Chip, TextField, MenuItem, Button, CircularProgress, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { schemeService } from '../../services/aiService';

const CATEGORIES = ['subsidy', 'insurance', 'loan', 'training', 'equipment', 'irrigation', 'other'];

const SchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await schemeService.list({ search: search || undefined, category: category || undefined, limit: 50 });
      setSchemes(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchSchemes, 300);
    return () => clearTimeout(timer);
  }, [fetchSchemes]);

  return (
    <Box>
      <PageHeader title="Government Schemes" subtitle="Discover subsidies, insurance, and loan schemes you may be eligible for.">
        <TextField
          size="small" placeholder="Search schemes..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </PageHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2.5}>
          {schemes.map((s, idx) => (
            <Grid item xs={12} md={6} key={s.id}>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{s.scheme_name}</Typography>
                    <Chip size="small" label={s.category} color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{s.description}</Typography>
                  {s.benefits && (
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Benefits:</strong> {s.benefits}</Typography>
                  )}
                  {s.eligibility && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}><strong>Eligibility:</strong> {s.eligibility}</Typography>
                  )}
                  {s.official_link && (
                    <Button size="small" endIcon={<OpenInNewIcon />} href={s.official_link} target="_blank" rel="noopener">
                      Official Website
                    </Button>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          ))}
          {schemes.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>No schemes found.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default SchemesPage;
