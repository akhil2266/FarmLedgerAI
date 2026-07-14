import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3, textAlign: 'center' }}>
      <BlockIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h5" fontWeight={700}>Access Denied</Typography>
      <Typography variant="body1" color="text.secondary">You do not have permission to view this page.</Typography>
      <Button variant="contained" onClick={() => navigate('/app/dashboard')}>Go to Dashboard</Button>
    </Box>
  );
};

export default UnauthorizedPage;
