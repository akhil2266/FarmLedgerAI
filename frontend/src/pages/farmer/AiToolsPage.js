import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Tabs, Tab, Grid, TextField, MenuItem, Button, Typography, Chip, CircularProgress,
  LinearProgress, Alert, List, ListItem, ListItemText, Divider,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BugReportIcon from '@mui/icons-material/BugReport';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { aiService } from '../../services/aiService';
import { farmService } from '../../services/farmService';
import { CROP_NAMES, SEASONS } from '../../utils/constants';

const PRIORITY_COLOR = { low: 'default', medium: 'info', high: 'warning', critical: 'error' };

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{children}</motion.div>;
}

const ResultCard = ({ children }) => (
  <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4, mt: 3 }}>{children}</Paper>
);

// -------------------- Crop Recommendation --------------------
const CropRecommendationTab = ({ farms }) => {
  const [form, setForm] = useState({ farmId: '', nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.farmId) { toast.error('Please select a farm'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.cropRecommendation(form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Ensure the AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField select fullWidth label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })}>
            {farms.map((f) => <MenuItem key={f.id} value={f.id}>{f.farm_name}</MenuItem>)}
          </TextField>
        </Grid>
        {[
          ['nitrogen', 'Nitrogen (N) kg/ha'], ['phosphorus', 'Phosphorus (P) kg/ha'], ['potassium', 'Potassium (K) kg/ha'],
          ['temperature', 'Temperature (°C)'], ['humidity', 'Humidity (%)'], ['ph', 'Soil pH'], ['rainfall', 'Rainfall (mm)'],
        ].map(([key, label]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <TextField fullWidth type="number" label={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit} disabled={loading} startIcon={<PsychologyIcon />}>
        {loading ? 'Analyzing...' : 'Get Recommendation'}
      </Button>

      {result && (
        <ResultCard>
          <Typography variant="overline" color="text.secondary">Recommended Crop</Typography>
          <Typography variant="h4" fontWeight={700} sx={{ textTransform: 'capitalize', mb: 1 }}>{result.recommended_crop}</Typography>
          <LinearProgress variant="determinate" value={result.confidence_score * 100} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{(result.confidence_score * 100).toFixed(1)}% confidence</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Top Alternatives</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {result.top_alternatives?.map((alt) => (
              <Chip key={alt.crop} label={`${alt.crop} (${(alt.confidence * 100).toFixed(0)}%)`} sx={{ textTransform: 'capitalize' }} />
            ))}
          </Box>
        </ResultCard>
      )}
    </Box>
  );
};

// -------------------- Profit Prediction --------------------
const ProfitPredictionTab = () => {
  const [form, setForm] = useState({ cropName: '', areaAcres: '', estimatedCost: '', soilType: 'loamy', season: 'kharif' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.profitPrediction(form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Ensure the AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Crop" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })}>
            {CROP_NAMES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Season" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
            {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth type="number" label="Area (acres)" value={form.areaAcres} onChange={(e) => setForm({ ...form, areaAcres: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth type="number" label="Estimated Cost (₹)" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} />
        </Grid>
      </Grid>
      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit} disabled={loading} startIcon={<TrendingUpIcon />}>
        {loading ? 'Calculating...' : 'Predict Profit'}
      </Button>

      {result && (
        <ResultCard>
          <Grid container spacing={2}>
            {[
              ['Predicted Yield', `${result.predicted_yield_kg} kg`], ['Price/kg', `₹${result.predicted_price_per_kg}`],
              ['Predicted Revenue', `₹${Number(result.predicted_revenue).toLocaleString('en-IN')}`],
              ['Predicted Profit', `₹${Number(result.predicted_profit).toLocaleString('en-IN')}`],
              ['ROI %', `${result.predicted_roi_percent}%`],
            ].map(([label, value]) => (
              <Grid item xs={6} sm={4} key={label}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" fontWeight={700}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </ResultCard>
      )}
    </Box>
  );
};

// -------------------- Price Prediction --------------------
const PricePredictionTab = () => {
  const [form, setForm] = useState({ cropName: '', marketName: '', state: '', forecastHorizonDays: 30 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.pricePrediction(form);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Ensure the AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField select fullWidth label="Crop" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })}>
            {CROP_NAMES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Market Name (optional)" value={form.marketName} onChange={(e) => setForm({ ...form, marketName: e.target.value })} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth type="number" label="Forecast Horizon (days)" value={form.forecastHorizonDays} onChange={(e) => setForm({ ...form, forecastHorizonDays: e.target.value })} />
        </Grid>
      </Grid>
      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit} disabled={loading} startIcon={<ShowChartIcon />}>
        {loading ? 'Forecasting...' : 'Predict Price'}
      </Button>

      {result && (
        <ResultCard>
          <Typography variant="overline" color="text.secondary">Predicted Price on {result.prediction_date}</Typography>
          <Typography variant="h4" fontWeight={700}>₹{result.predicted_price_per_kg} / kg</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Confidence: {(result.confidence_score * 100).toFixed(1)}%</Typography>
        </ResultCard>
      )}
    </Box>
  );
};

// -------------------- Disease Detection --------------------
const DiseaseDetectionTab = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropName, setCropName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload an image of the crop leaf.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('cropName', cropName);
      const res = await aiService.diseaseDetection(fd);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Detection failed. Ensure the AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Crop (optional)" value={cropName} onChange={(e) => setCropName(e.target.value)}>
            {CROP_NAMES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} sx={{ height: 56 }}>
            {file ? file.name : 'Upload Leaf Image'}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Grid>
      </Grid>
      {preview && (
        <Box component="img" src={preview} alt="preview" sx={{ mt: 2, maxHeight: 220, borderRadius: 3, display: 'block' }} />
      )}
      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit} disabled={loading} startIcon={<BugReportIcon />}>
        {loading ? 'Analyzing...' : 'Detect Disease'}
      </Button>

      {result && (
        <ResultCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>{result.detected_disease}</Typography>
            <Chip label={result.is_healthy ? 'Healthy' : `Severity: ${result.severity}`} color={result.is_healthy ? 'success' : 'error'} />
          </Box>
          <Typography variant="body2" color="text.secondary">Confidence: {(result.confidence_score * 100).toFixed(1)}%</Typography>
          {result.recommended_treatment && (
            <Alert severity="info" sx={{ mt: 2 }}>{result.recommended_treatment}</Alert>
          )}
        </ResultCard>
      )}
    </Box>
  );
};

// -------------------- Financial Advisor --------------------
const FinancialAdvisorTab = () => {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiService.listFinancialAdvice({ limit: 20 });
      setAdvice(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdvice(); }, [fetchAdvice]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await aiService.generateFinancialAdvice();
      toast.success('New financial advice generated');
      fetchAdvice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate advice');
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = async (id) => {
    await aiService.dismissAdvice(id);
    fetchAdvice();
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleGenerate} disabled={generating} startIcon={<AccountBalanceIcon />}>
        {generating ? 'Analyzing your finances...' : 'Generate Fresh Advice'}
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <List sx={{ mt: 2 }}>
          {advice.map((a) => (
            <Paper key={a.id} className="glass-panel" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Typography fontWeight={700}>{a.title}</Typography>
                    <Chip size="small" label={a.priority} color={PRIORITY_COLOR[a.priority]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{a.description}</Typography>
                </Box>
                <Button size="small" onClick={() => handleDismiss(a.id)}>Dismiss</Button>
              </Box>
            </Paper>
          ))}
          {advice.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 3 }}>No advice yet. Click "Generate Fresh Advice" to analyze your finances.</Typography>
          )}
        </List>
      )}
    </Box>
  );
};

const AiToolsPage = () => {
  const [tab, setTab] = useState(0);
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    farmService.list().then((res) => setFarms(res.data)).catch(() => {});
  }, []);

  return (
    <Box>
      <PageHeader title="AI Tools" subtitle="AI-powered insights for crop selection, profitability, pricing, disease detection, and finance." />

      <Paper className="glass-panel" sx={{ borderRadius: 4, p: { xs: 2, sm: 3 } }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
          <Tab icon={<PsychologyIcon />} iconPosition="start" label="Crop Recommendation" />
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Profit Prediction" />
          <Tab icon={<ShowChartIcon />} iconPosition="start" label="Price Prediction" />
          <Tab icon={<BugReportIcon />} iconPosition="start" label="Disease Detection" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Financial Advisor" />
        </Tabs>

        <TabPanel value={tab} index={0}><CropRecommendationTab farms={farms} /></TabPanel>
        <TabPanel value={tab} index={1}><ProfitPredictionTab /></TabPanel>
        <TabPanel value={tab} index={2}><PricePredictionTab /></TabPanel>
        <TabPanel value={tab} index={3}><DiseaseDetectionTab /></TabPanel>
        <TabPanel value={tab} index={4}><FinancialAdvisorTab /></TabPanel>
      </Paper>
    </Box>
  );
};

export default AiToolsPage;
