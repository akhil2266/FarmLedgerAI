import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LockResetIcon from '@mui/icons-material/LockReset';
import { authService } from '../../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            <Typography variant="h5" fontWeight={700}>Reset your password</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Enter your email and we'll send you a reset link.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {sent ? (
            <Alert severity="success">If that email exists in our system, a reset link has been sent.</Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth required type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.2 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
