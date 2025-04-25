import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, Checkbox, FormControlLabel, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import UserService from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { maskEmail } from '../../utils/formatUtils';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reactivateUserId, setReactivateUserId] = useState(null);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user && user.roles.includes('ROLE_ADMIN')) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UserService.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
    }
    setLoading(false);
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user, roles: user.roles.map(r => typeof r === 'string' ? r : r.name || r) });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditUser(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role) => {
    setEditUser(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleEditSave = async () => {
    try {
      // Convert roles to objects if needed
      const updated = { ...editUser, roles: editUser.roles.map(r => (typeof r === 'string' ? { name: r } : r)) };
      await UserService.updateUser(editUser.id, updated);
      setSnackbar({ open: true, message: 'User updated', severity: 'success' });
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteUserId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await UserService.deleteUser(deleteUserId);
      setSnackbar({ open: true, message: 'User deactivated', severity: 'info' });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to deactivate user', severity: 'error' });
    }
  };
  
  const handleReactivateClick = (id) => {
    setReactivateUserId(id);
    setReactivateDialogOpen(true);
  };
  
  const handleReactivateConfirm = async () => {
    try {
      setLoading(true);
      const response = await UserService.reactivateUser(reactivateUserId);
      console.log("Reactivation response:", response.data);
      
      // Update the user in the local state to reflect changes immediately
      setUsers(users.map(u => {
        if (u.id === reactivateUserId) {
          // Create a new user object with updated fields
          return {
            ...u,
            active: true,
            createDateTime: new Date().toISOString() // Set to current time
          };
        }
        return u;
      }));
      
      setSnackbar({ open: true, message: 'User reactivated successfully', severity: 'success' });
      setReactivateDialogOpen(false);
      
      // Fetch the updated list from server to ensure UI is in sync
      fetchUsers();
    } catch (err) {
      console.error("Reactivation error:", err);
      setSnackbar({ open: true, message: 'Failed to reactivate user: ' + (err.response?.data?.message || err.message), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to check if account is expired
  const isAccountExpired = (user) => {
    // First check if the user is marked as inactive
    if (!user.active) {
      return true;
    }
    
    // Then check if the account is expired by date
    if (user.createDateTime) {
      const expiryDate = new Date(user.createDateTime);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      return expiryDate < new Date();
    }
    
    return false;
  };
  
  const getAccountStatus = (user) => {
    if (!user.active) {
      return <Chip label="Inactive" color="error" size="small" />;
    }
    
    // Check if account is expired
    if (user.createDateTime) {
      const expiryDate = new Date(user.createDateTime);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      if (expiryDate < new Date()) {
        return <Chip label="Expired" color="error" size="small" />;
      }
    }
    
    return <Chip label="Active" color="success" size="small" />;
  };
  
  // Helper to get account status reason
  const getAccountStatusReason = (user) => {
    if (!user.active) {
      return user.failedLoginAttempts >= 5 ? 
        "Deactivated (too many failed login attempts)" :
        "Manually deactivated";
    }
    
    if (isAccountExpired(user)) {
      return "Account expired";
    }
    
    return "Active";
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  if (!user || !user.roles.includes('ROLE_ADMIN')) {
    return <Box p={4}><Typography>You do not have access to this page.</Typography></Box>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>User Management</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>MFA Enabled</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Failed Attempts</TableCell>
              <TableCell>Status Reason</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow 
                key={u.id}
                sx={{ 
                  bgcolor: isAccountExpired(u) ? 'rgba(244, 67, 54, 0.08)' : 'inherit'
                }}
              >
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{maskEmail(u.email)}</TableCell>
                <TableCell>
                  {Array.isArray(u.roles)
                    ? u.roles.map(r => (typeof r === 'string' ? r : r.name)).join(', ')
                    : ''}
                </TableCell>
                <TableCell>
                  {u.mfaEnabled ? <Chip label="Enabled" color="success" size="small" /> : <Chip label="Disabled" color="default" size="small" />}
                </TableCell>
                <TableCell>
                  {getAccountStatus(u)}
                </TableCell>
                <TableCell>
                  {u.failedLoginAttempts || 0}
                </TableCell>
                <TableCell>
                  {getAccountStatusReason(u)}
                </TableCell>
                <TableCell>
                  {formatDate(u.createDateTime ? new Date(new Date(u.createDateTime).setFullYear(new Date(u.createDateTime).getFullYear() + 1)) : null)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleEditClick(u)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    
                    {!isAccountExpired(u) && u.active ? (
                      <IconButton color="error" onClick={() => handleDeleteClick(u.id)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Tooltip title="Reactivate User Account">
                        <IconButton color="success" onClick={() => handleReactivateClick(u.id)} size="small">
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField label="Username" value={editUser.username} onChange={e => handleEditChange('username', e.target.value)} />
              <TextField 
                label="Email" 
                value={editUser.email} 
                onChange={e => handleEditChange('email', e.target.value)} 
                helperText="Email addresses are masked for privacy in the user list view" 
              />
              <Box>
                <Typography variant="subtitle2">Roles</Typography>
                <FormControlLabel
                  control={<Checkbox checked={editUser.roles.includes('ROLE_USER')} onChange={() => handleRoleToggle('ROLE_USER')} />}
                  label="User"
                />
                <FormControlLabel
                  control={<Checkbox checked={editUser.roles.includes('ROLE_ADMIN')} onChange={() => handleRoleToggle('ROLE_ADMIN')} />}
                  label="Admin"
                />
              </Box>
              <FormControlLabel
                control={<Checkbox checked={editUser.mfaEnabled} onChange={e => handleEditChange('mfaEnabled', e.target.checked)} />}
                label="MFA Enabled"
              />
              <FormControlLabel
                control={<Checkbox checked={editUser.active} onChange={e => handleEditChange('active', e.target.checked)} />}
                label="Active Account"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CancelIcon />} onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button startIcon={<SaveIcon />} onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate this user account? The user will no longer be able to log in.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
      
      {/* Reactivate Dialog */}
      <Dialog open={reactivateDialogOpen} onClose={() => setReactivateDialogOpen(false)}>
        <DialogTitle>Reactivate User Account</DialogTitle>
        <DialogContent>
          <Typography>
            Reactivating this account will:
          </Typography>
          <ul>
            <li>Restore user access to the system</li>
            <li>Reset the account expiry date to one year from today</li>
            <li>Allow the user to log in immediately</li>
          </ul>
          <Typography>Do you want to continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReactivateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReactivateConfirm} color="success" variant="contained">
            Reactivate Account
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 