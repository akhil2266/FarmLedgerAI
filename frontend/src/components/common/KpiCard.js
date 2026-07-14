import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const formatValue = (value, format) => {
  if (format === 'currency') return `₹${Number(value || 0).toLocaleString('en-IN')}`;
  if (format === 'percent') return `${Number(value || 0).toFixed(1)}%`;
  return Number(value || 0).toLocaleString('en-IN');
};

const KpiCard = ({ title, value, format = 'number', icon, color = 'primary.main', trend, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
  >
    <Paper className="glass-panel" elevation={0} sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${color}, transparent)`, backgroundColor: 'rgba(0,0,0,0.04)',
        }}>
          {icon}
        </Box>
        {trend !== undefined && (
          <Typography variant="caption" fontWeight={700} color={trend >= 0 ? 'success.main' : 'error.main'}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </Typography>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>{formatValue(value, format)}</Typography>
    </Paper>
  </motion.div>
);

export default KpiCard;
