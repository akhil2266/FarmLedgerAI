import React, { useState } from 'react';
import { Box, Paper, Grid, TextField, Button, Typography, Avatar, Divider } from '@mui/material';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { INDIAN_STATES } from '../../utils/constants';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.full_name || '', phone: user?.phone || '', address: user?.address || '',
    state: user?.state || '', district: user?.district || '', pincode: user?.pincode || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    setSavingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Manage your account information and security settings." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{user?.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} SelectProps={{ native: true }}>
                  <option value="" />
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 3 }} onClick={handleProfileSave} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Change Password</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth type="password" label="Current Password" sx={{ mb: 2 }}
              value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <TextField
              fullWidth type="password" label="New Password" helperText="At least 8 characters, including a number" sx={{ mb: 2 }}
              value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Button variant="contained" onClick={handlePasswordChange} disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change Password'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
