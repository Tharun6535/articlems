import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';

const Login = () => {
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleDirectLogin = async (role) => {
    try {
      const response = await axios.post(`http://localhost:8081/api/auth/direct-login/${role}`);
      if (response.data.requires2FA) {
        setTempToken(response.data.tempToken);
        setShow2FADialog(true);
      } else {
        // Handle successful login without 2FA
        localStorage.setItem('token', response.data.token);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handle2FAVerification = async () => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/verify-2fa', {
        tempToken,
        code: verificationCode
      });
      
      if (response.data.verified) {
        localStorage.setItem('token', response.data.token);
        setShow2FADialog(false);
        window.location.href = '/';
      } else {
        alert('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      alert('Error verifying 2FA code. Please try again.');
    }
  };

  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Having trouble logging in? Try the direct login options:
      </Typography>
      <Button 
        variant="outlined" 
        color="secondary"
        onClick={() => handleDirectLogin('superadmin')}
        sx={{ mr: 2 }}
      >
        Direct Login (superadmin)
      </Button>
      <Button 
        variant="outlined" 
        color="secondary"
        onClick={() => {
          window.location.href = `http://localhost:8081/api/auth/setup-admin`;
        }}
      >
        Create Admin User
      </Button>

      <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)}>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Please enter the verification code from your authenticator app
            </Typography>
            <TextField
              margin="normal"
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FADialog(false)}>Cancel</Button>
          <Button onClick={handle2FAVerification} variant="contained" color="primary">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 