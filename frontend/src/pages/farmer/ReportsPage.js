import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Grid, Typography, TextField, MenuItem, Button, List, ListItem, ListItemText,
  ListItemIcon, Chip, CircularProgress, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { reportService } from '../../services/aiService';

const REPORT_TYPES = [
  { value: 'profit_loss', label: 'Profit & Loss' },
  { value: 'expense_summary', label: 'Expense Summary' },
  { value: 'sales_summary', label: 'Sales Summary' },
  { value: 'roi_analysis', label: 'ROI Analysis' },
  { value: 'full_farm_report', label: 'Full Farm Report' },
];

const API_ORIGIN = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const ReportsPage = () => {
  const [reportType, setReportType] = useState('profit_loss');
  const [format, setFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.list({ limit: 20 });
      setReports(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportService.generate({ reportType, format, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
      toast.success('Report generated successfully');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Generate downloadable PDF or Excel financial reports." />

      <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {REPORT_TYPES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={2.5}>
            <TextField fullWidth type="date" label="From" InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Grid>
          <Grid item xs={6} sm={2.5}>
            <TextField fullWidth type="date" label="To" InputLabelProps={{ shrink: true }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <ToggleButtonGroup fullWidth exclusive value={format} onChange={(e, v) => v && setFormat(v)}>
              <ToggleButton value="pdf"><PictureAsPdfIcon sx={{ mr: 1 }} fontSize="small" /> PDF</ToggleButton>
              <ToggleButton value="excel"><DescriptionIcon sx={{ mr: 1 }} fontSize="small" /> Excel</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 2.5 }} onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Report'}
        </Button>
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Report History</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4 }}>
          <List>
            {reports.map((r) => (
              <ListItem
                key={r.id}
                secondaryAction={
                  <Button
                    size="small" startIcon={<DownloadIcon />}
                    href={`${API_ORIGIN}${r.file_url}`} target="_blank" rel="noopener"
                  >
                    Download
                  </Button>
                }
              >
                <ListItemIcon>{r.format === 'pdf' ? <PictureAsPdfIcon color="error" /> : <DescriptionIcon color="success" />}</ListItemIcon>
                <ListItemText
                  primary={r.report_type.replace(/_/g, ' ')}
                  secondary={`${new Date(r.created_at).toLocaleString('en-IN')} ${r.date_from ? `· ${r.date_from} to ${r.date_to}` : ''}`}
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip size="small" label={r.format.toUpperCase()} sx={{ mr: 2 }} />
              </ListItem>
            ))}
            {reports.length === 0 && (
              <ListItem><ListItemText primary="No reports generated yet." sx={{ color: 'text.secondary', textAlign: 'center' }} /></ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage;
