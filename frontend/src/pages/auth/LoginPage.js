import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Link, InputAdornment, IconButton, Alert, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import GrassIcon from '@mui/icons-material/Grass';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname;
      if (from) navigate(from);
      else if (user.role === 'admin') navigate('/app/admin/overview');
      else if (user.role === 'buyer') navigate('/app/buyer/dashboard');
      else navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="gradient-bg-light" sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper className="glass-panel" elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, width: 420, maxWidth: '92vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', mb: 1.5,
            }}>
              <GrassIcon sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to FarmLedger AI</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} required
              onChange={(e) => setPassword(e.target.value)} sx={{ mb: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">Forgot password?</Link>
            </Box>
            <Button
              fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ py: 1.2, background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', fontWeight: 700 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Typography variant="body2" textAlign="center">
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600}>Create one</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
