import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Grid, Typography, MenuItem, TextField, CircularProgress, Alert } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { farmService } from '../../services/farmService';
import { weatherService } from '../../services/aiService';

const WeatherPage = () => {
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    farmService.list().then((res) => {
      setFarms(res.data);
      if (res.data.length) setFarmId(res.data[0].id);
    });
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const res = await weatherService.getForFarm(farmId);
      setWeather(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  return (
    <Box>
      <PageHeader title="Weather" subtitle="Live weather and 7-day forecast for your farms.">
        <TextField select size="small" label="Farm" value={farmId} onChange={(e) => setFarmId(e.target.value)} sx={{ minWidth: 200 }}>
          {farms.map((f) => <MenuItem key={f.id} value={f.id}>{f.farm_name}</MenuItem>)}
        </TextField>
      </PageHeader>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}
      {error && <Alert severity="warning">{error}</Alert>}

      {weather?.current && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Paper className="glass-panel" sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="overline" color="text.secondary">Current Conditions</Typography>
                <Typography variant="h2" fontWeight={700}>{Math.round(weather.current.temperature)}°C</Typography>
                <Typography sx={{ textTransform: 'capitalize' }} color="text.secondary">{weather.current.condition_text}</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ThermostatIcon color="warning" /><Typography variant="body2">Feels like {Math.round(weather.current.feels_like)}°C</Typography></Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WaterDropIcon color="info" /><Typography variant="body2">{weather.current.humidity}% humidity</Typography></Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AirIcon color="action" /><Typography variant="body2">{Math.round(weather.current.wind_speed_kmh || 0)} km/h wind</Typography></Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>7-Day Forecast</Typography>
          <Grid container spacing={2}>
            {(weather.forecast || []).map((day, idx) => (
              <Grid item xs={6} sm={4} md={12 / 7} key={day.id}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Paper className="glass-panel" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{new Date(day.forecast_date).toLocaleDateString('en-IN', { weekday: 'short' })}</Typography>
                    <Typography variant="h6" fontWeight={700}>{Math.round(day.temperature)}°</Typography>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }} color="text.secondary">{day.condition_text}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default WeatherPage;
