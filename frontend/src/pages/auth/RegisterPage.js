import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Link, Alert, Grid, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import GrassIcon from '@mui/icons-material/Grass';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', role: 'farmer', state: '', district: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'buyer' ? '/app/buyer/dashboard' : '/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="gradient-bg-light" sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, py: 4,
    }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper className="glass-panel" elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, width: 520, maxWidth: '92vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', mb: 1.5,
            }}>
              <GrassIcon sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Create your account</Typography>
            <Typography variant="body2" color="text.secondary">Join FarmLedger AI in seconds</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <ToggleButtonGroup
              exclusive fullWidth value={form.role}
              onChange={(e, val) => val && setForm((f) => ({ ...f, role: val }))}
              sx={{ mb: 2.5 }}
            >
              <ToggleButton value="farmer" sx={{ py: 1.2, textTransform: 'none', fontWeight: 600 }}>
                <AgricultureIcon sx={{ mr: 1 }} fontSize="small" /> I'm a Farmer
              </ToggleButton>
              <ToggleButton value="buyer" sx={{ py: 1.2, textTransform: 'none', fontWeight: 600 }}>
                <StorefrontIcon sx={{ mr: 1 }} fontSize="small" /> I'm a Buyer
              </ToggleButton>
            </ToggleButtonGroup>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Full Name" value={form.fullName} onChange={handleChange('fullName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Email" type="email" value={form.email} onChange={handleChange('email')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required select label="State" value={form.state} onChange={handleChange('state')} SelectProps={{ native: true }}>
                  <option value="" />
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="District" value={form.district} onChange={handleChange('district')} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth required label="Password" type="password" value={form.password}
                  onChange={handleChange('password')} helperText="At least 8 characters, including a number"
                />
              </Grid>
            </Grid>

            <Button
              fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ mt: 3, py: 1.2, background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', fontWeight: 700 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600}>Sign in</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;
