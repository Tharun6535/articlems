import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Avatar,
  Grid,
  Fade,
  CircularProgress,
  alpha,
  Card,
  Stack
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthService from '../../services/auth.service';
import UserService from '../../services/user.service';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA states
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [currentMfaUsername, setCurrentMfaUsername] = useState('');
  
  // Remove email-based reset states
  // Add TOTP-based reset states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetMfaCode, setResetMfaCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMfaEnabled, setResetMfaEnabled] = useState(null); // null=not checked, true/false=checked
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, validateMfa, mfaRequired, mfaUsername } = useAuth();
  const theme = useTheme();

  // Get the page the user was trying to access, or default to home
  const from = location.state?.from?.pathname || '/';
  
  // Debug logging for MFA username
  useEffect(() => {
    if (showMfaDialog) {
      console.log('MFA dialog opened for username:', username);
      console.log('MFA username in context:', mfaUsername);
      // Store username locally to ensure it's available for MFA validation
      setCurrentMfaUsername(username);
    }
  }, [showMfaDialog, username, mfaUsername]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!username || !password) {
      setMessage('Username and password are required!');
      setLoading(false);
      return;
    }

    try {
      const response = await login(username, password);
      
      // If MFA is required
      if (response.mfaRequired) {
        console.log('MFA required, showing dialog for:', username);
        setCurrentMfaUsername(username);
        setShowMfaDialog(true);
        setLoading(false);
        return;
      }
      
      console.log('Login successful, redirecting to:', from);
      // Redirect to the previous page or home
      navigate(from, { replace: true });
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setLoading(false);
      setMessage(resMessage || 'Invalid username or password.');
    }
  };
  
  const handleMfaSubmit = async () => {
    if (!mfaCode || mfaCode.trim() === '') {
      setMfaError('Please enter the verification code from your authenticator app');
      return;
    }

    setMfaError('');
    setLoading(true);
    
    try {
      // Make sure we have a username to use for MFA validation
      const usernameForMfa = currentMfaUsername || mfaUsername || username;
      console.log('Validating MFA code for user:', usernameForMfa);
      
      if (!usernameForMfa) {
        throw new Error('Username is missing for MFA validation');
      }
      
      // Pass the username directly to validateMfa
      const response = await validateMfa(mfaCode, usernameForMfa);
      
      // Check if validation failed
      if (response && !response.valid) {
        setMfaError(response.message || 'Invalid verification code. Please try again.');
        setLoading(false);
        setMfaCode('');
        return;
      }
      
      // Success
      setShowMfaDialog(false);
      setMfaCode('');
      console.log('MFA validation successful, redirecting to:', from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('MFA validation error:', error);
      
      // Extract error message from response if available
      const errorMessage = 
        error.response?.data?.message || 
        error.message ||
        'Error validating code. Please try again.';
      
      setMfaError(errorMessage);
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOpenResetDialog = () => {
    setShowResetDialog(true);
    setResetUsername('');
    setResetMfaCode('');
    setResetNewPassword('');
    setResetMessage('');
  };

  const handleCloseResetDialog = () => {
    setShowResetDialog(false);
    setResetUsername('');
    setResetMfaCode('');
    setResetNewPassword('');
    setResetMessage('');
    setResetLoading(false);
  };

  const handleResetUsernameBlur = async () => {
    if (!resetUsername) {
      setResetMfaEnabled(null);
      return;
    }
    setResetMfaEnabled(null);
    setResetMessage('');
    try {
      const res = await UserService.getPublicUserByUsername(resetUsername);
      if (res.data && typeof res.data.mfaEnabled !== 'undefined') {
        setResetMfaEnabled(res.data.mfaEnabled);
        if (!res.data.mfaEnabled) {
          setResetMessage('This user does not have MFA enabled. Please contact the administrator to reset your password.');
        } else {
          setResetMessage('');
        }
      } else {
        setResetMfaEnabled(null);
        setResetMessage('User not found.');
      }
    } catch (err) {
      setResetMfaEnabled(null);
      setResetMessage('User not found.');
    }
  };

  const handleRequestReset = async () => {
    if (!resetUsername) {
      setResetMessage('Username is required.');
      return;
    }
    if (resetMfaEnabled === false) {
      setResetMessage('This user does not have MFA enabled. Please contact the administrator.');
      return;
    }
    if (!resetMfaCode || !resetNewPassword) {
      setResetMessage('All fields are required.');
      return;
    }
    setResetLoading(true);
    setResetMessage('');
    try {
      await AuthService.resetPasswordWithMfa(resetUsername, resetMfaCode, resetNewPassword);
      setResetMessage('Password reset successful. You can now log in.');
    } catch (err) {
      setResetMessage(
        err.response?.data?.message || 'Error resetting password.'
      );
    }
    setResetLoading(false);
  };

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 6,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Card
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: { xs: 3, sm: 5 },
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              overflow: 'visible'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4,
                position: 'relative'
              }}
            >
              <Avatar
                sx={{
                  mb: 2,
                  width: 66,
                  height: 66,
                  backgroundColor: 'primary.main',
                  boxShadow: '0 8px 16px rgba(67, 97, 238, 0.2)',
                  transform: 'translateY(-50%)',
                  position: 'absolute',
                  top: 0
                }}
              >
                <LoginIcon fontSize="large" />
              </Avatar>
              
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  align="center" 
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Sign in to your account to continue
                </Typography>
              </Box>
            </Box>
            
            {message && (
              <Alert 
                severity="error" 
                icon={<ErrorOutlineIcon fontSize="inherit" />}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                }}
              >
                {message}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    py: 1.5, 
                    position: 'relative',
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      color="inherit" 
                      sx={{ position: 'absolute' }} 
                    />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>

            <Box sx={{ width: '100%', textAlign: 'right', mt: 1 }}>
              <Button size="small" onClick={handleOpenResetDialog} sx={{ textTransform: 'none' }}>
                Forgot password? (MFA)
              </Button>
            </Box>
          </Card>
        </Fade>
        
        {/* 2FA Dialog */}
        <Dialog 
          open={showMfaDialog} 
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              px: 1
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <Avatar
              sx={{
                mb: 2,
                width: 60,
                height: 60,
                backgroundColor: 'primary.main',
                boxShadow: '0 8px 16px rgba(67, 97, 238, 0.2)',
                mx: 'auto'
              }}
            >
              <SecurityIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="div" fontWeight={700}>
              Two-Factor Authentication
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Please enter the verification code from your authenticator app
            </Typography>
            
            {mfaError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2
                }}
              >
                {mfaError}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Authentication Code"
              type="text"
              fullWidth
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              variant="outlined"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{ mt: 1 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 4, justifyContent: 'center' }}>
            <Button 
              onClick={() => {
                setShowMfaDialog(false);
                setMfaCode('');
                setMfaError('');
              }}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Back
            </Button>
            <Button 
              onClick={handleMfaSubmit} 
              variant="contained"
              disabled={loading}
              startIcon={<VerifiedUserIcon />}
              sx={{ 
                borderRadius: 2,
                position: 'relative',
                minWidth: 120
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Verify'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog open={showResetDialog} onClose={handleCloseResetDialog}>
          <DialogTitle>Reset Password (MFA)</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              value={resetUsername}
              onChange={e => { setResetUsername(e.target.value); setResetMfaEnabled(null); setResetMessage(''); }}
              onBlur={handleResetUsernameBlur}
              disabled={resetLoading}
            />
            {resetMfaEnabled === false && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This user does not have MFA enabled. Please contact the administrator to reset your password.
              </Alert>
            )}
            {resetMfaEnabled && (
              <>
                <TextField
                  margin="dense"
                  label="TOTP Code"
                  type="text"
                  fullWidth
                  value={resetMfaCode}
                  onChange={e => setResetMfaCode(e.target.value)}
                  disabled={resetLoading}
                />
                <TextField
                  margin="dense"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={resetNewPassword}
                  onChange={e => setResetNewPassword(e.target.value)}
                  disabled={resetLoading}
                />
              </>
            )}
            {resetMessage && (
              <Alert severity={resetMessage.includes('successful') ? 'success' : resetMfaEnabled === false ? 'warning' : 'error'} sx={{ mt: 2 }}>{resetMessage}</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetDialog} disabled={resetLoading}>Cancel</Button>
            <Button onClick={handleRequestReset} disabled={resetLoading || !resetMfaEnabled} variant="contained">
              {resetLoading ? <CircularProgress size={20} /> : 'Reset Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Login; 