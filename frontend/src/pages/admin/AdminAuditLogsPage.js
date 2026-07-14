import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, TableContainer } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { adminService } from '../../services/aiService';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.auditLogs({ limit: 100 });
      setLogs(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <Box>
      <PageHeader title="Audit Logs" subtitle="Track sensitive administrative actions across the platform." />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper className="glass-panel" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id} hover>
                    <TableCell><Chip size="small" label={l.action.replace(/_/g, ' ')} color="primary" variant="outlined" /></TableCell>
                    <TableCell>{l.user_name || 'System'}</TableCell>
                    <TableCell>{l.entity_type ? `${l.entity_type} #${l.entity_id}` : '—'}</TableCell>
                    <TableCell>{l.ip_address || '—'}</TableCell>
                    <TableCell>{new Date(l.created_at).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No audit log entries yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AdminAuditLogsPage;
