import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const PageHeader = ({ title, subtitle, actionLabel, onAction, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
    <Box>
      <Typography variant="h4" fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      {children}
      {actionLabel && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction} sx={{
          background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
          '&:hover': { background: 'linear-gradient(135deg, #1B5E20, #43A047)' },
        }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  </Box>
);

export default PageHeader;
