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
  useTheme
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArticleIcon from '@mui/icons-material/Article';

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

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 8,
        backgroundColor: '#fafafa'
      }}
    >
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 3
          }}
        >
          <ArticleIcon 
            color="secondary" 
            sx={{ 
              fontSize: 48, 
              mb: 2,
              transform: 'rotate(-5deg)'
            }} 
          />
          <Typography 
            component="h1" 
            variant="h3" 
            align="center" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              mb: 1
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            component="p" 
            variant="subtitle1" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 400, mb: 4 }}
          >
            Sign in to continue to your account
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {message && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
              variant="outlined"
            >
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': {
                    borderColor: 'secondary.main',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'secondary.main',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '&:hover fieldset': {
                    borderColor: 'secondary.main',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'secondary.main',
                }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                mt: 2, 
                mb: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: 'none',
                fontSize: '1rem',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(3, 168, 124, 0.23)',
                  transform: 'translateY(-1px)'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ 
                  px: 4,
                  '&:hover': {
                    backgroundColor: 'rgba(3, 168, 124, 0.04)'
                  }
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* MFA Dialog */}
      <Dialog 
        open={showMfaDialog} 
        onClose={() => !loading && setShowMfaDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: { 
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0', 
          py: 2.5,
          typography: 'h5'
        }}>
          Two-Factor Authentication
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockOutlinedIcon
              color="secondary"
              sx={{ fontSize: 48, mb: 2 }}
            />
          </Box>
          
          <Typography 
            variant="body1" 
            gutterBottom 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            Please enter the 6-digit verification code from your authenticator app
          </Typography>
          
          {mfaError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              variant="outlined"
            >
              {mfaError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="normal"
            id="mfaCode"
            label="Verification Code"
            type="text"
            fullWidth
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            inputProps={{ 
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleMfaSubmit();
              }
            }}
            placeholder="000000"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: 'secondary.main',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'secondary.main',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setShowMfaDialog(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleMfaSubmit} 
            color="secondary" 
            variant="contained"
            disabled={loading}
            sx={{ px: 3 }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 