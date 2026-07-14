import React, { useEffect, useState, useCallback } from 'react';
import { Menu, Box, Typography, List, ListItemButton, ListItemText, Divider, Button, CircularProgress, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '../../services/aiService';

const TYPE_COLOR = {
  weather_alert: 'info', price_alert: 'warning', disease_alert: 'error',
  scheme_update: 'success', payment: 'primary', system: 'default',
  ai_advice: 'secondary', sale: 'success', expense: 'default',
};

const NotificationPanel = ({ anchorEl, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.list({ limit: 10 });
      setNotifications(res.data.rows || []);
    } catch (err) {
      // silent fail - non-critical UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (anchorEl) fetchNotifications();
  }, [anchorEl, fetchNotifications]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleItemClick = async (id) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{ sx: { width: 380, maxHeight: 480 } }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
        <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
        </Box>
      ) : (
        <List sx={{ py: 0 }}>
          {notifications.map((n) => (
            <ListItemButton
              key={n.id}
              onClick={() => handleItemClick(n.id)}
              sx={{ opacity: n.is_read ? 0.6 : 1, alignItems: 'flex-start', py: 1.25 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
                    <Chip label={n.type.replace('_', ' ')} size="small" color={TYPE_COLOR[n.type] || 'default'} sx={{ height: 18, fontSize: 10 }} />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary" component="div">{n.message}</Typography>
                    <Typography variant="caption" color="text.disabled">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</Typography>
                  </>
                }
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Menu>
  );
};

export default NotificationPanel;
