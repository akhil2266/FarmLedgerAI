import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LockResetIcon from '@mui/icons-material/LockReset';
import { authService } from '../../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="gradient-bg-light" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper className="glass-panel" elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, width: 420, maxWidth: '92vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <LockResetIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Set a new password</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success ? (
            <Alert severity="success">Password reset! Redirecting to sign in...</Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth required type="password" label="New Password" value={password}
                onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }}
                helperText="At least 8 characters, including a number"
              />
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.2 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          )}

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/login" fontWeight={600}>Back to sign in</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ResetPasswordPage;
