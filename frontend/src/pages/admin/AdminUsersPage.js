import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, MenuItem,
  Button, CircularProgress, InputAdornment, TableContainer,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import { adminService } from '../../services/aiService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers({ search: search || undefined, role: role || undefined, limit: 50 });
      setUsers(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggle = async (u) => {
    try {
      if (u.is_active) await adminService.deactivateUser(u.id);
      else await adminService.activateUser(u.id);
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <Box>
      <PageHeader title="Users" subtitle="Manage all farmers, buyers, and admins on the platform.">
        <TextField
          size="small" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="farmer">Farmer</MenuItem>
          <MenuItem value="buyer">Buyer</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
      </PageHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip size="small" label={u.role} sx={{ textTransform: 'capitalize' }} /></TableCell>
                    <TableCell>{u.district ? `${u.district}, ${u.state}` : '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell align="right">
                      {u.role !== 'admin' && (
                        <Button size="small" color={u.is_active ? 'error' : 'success'} onClick={() => handleToggle(u)}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AdminUsersPage;
