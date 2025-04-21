import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, Checkbox, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import UserService from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      setSnackbar({ open: true, message: 'User deleted', severity: 'info' });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {Array.isArray(u.roles)
                    ? u.roles.map(r => (typeof r === 'string' ? r : r.name)).join(', ')
                    : ''}
                </TableCell>
                <TableCell>
                  {u.mfaEnabled ? <Chip label="Enabled" color="success" size="small" /> : <Chip label="Disabled" color="default" size="small" />}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(u)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(u.id)}><DeleteIcon /></IconButton>
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
              <TextField label="Email" value={editUser.email} onChange={e => handleEditChange('email', e.target.value)} />
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
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm} variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 