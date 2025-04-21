import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText,
  TextField,
  Paper,
  Grid,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import UserService from '../../services/user.service';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import AuthService from "../../services/auth.service";
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PasswordIcon from '@mui/icons-material/Password';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  
  // User information states
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loadingAction, setLoadingAction] = useState(false);

  // 2FA State
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [loadingQR, setLoadingQR] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);

  // Current user state
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: "",
    email: "",
    roles: [],
  });

  useEffect(() => {
    // Wait for auth context to finish loading
    if (loading) {
      return;
    }

    console.log("Profile component - user:", user);
    
    // Only redirect if auth has finished loading and there's no user
    if (!loading && !user) {
      console.log("No user found after loading, redirecting to login");
      navigate('/login');
      return;
    }

    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setIsLoading(false);
      
      // Check if user has 2FA enabled
      const check2FAStatus = async () => {
        try {
          const response = await UserService.get2FAStatus();
          console.log("2FA status response:", response.data);
          setIs2FAEnabled(response.data);
        } catch (error) {
          console.error('Error checking 2FA status:', error);
          if (error.response && error.response.status === 401) {
            // If unauthorized, the token might be expired
            setSnackbar({
              open: true,
              message: 'Your session has expired. Please log in again.',
              severity: 'error'
            });
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        }
      };
      
      check2FAStatus();
    }
  }, [user, navigate, loading]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  const handle2FAToggle = async () => {
    if (!is2FAEnabled) {
      try {
        const response = await UserService.generate2FASecret();
        setSecret(response.data.secret);
        setQrCode(response.data.qrCode);
        console.log("QR Code received:", response.data.qrCode);
        setShowQRDialog(true);
      } catch (error) {
        console.error('Error generating 2FA secret:', error);
        setSnackbar({
          open: true,
          message: 'Error generating 2FA secret',
          severity: 'error'
        });
      }
    } else {
      try {
        await UserService.disable2FA();
        setIs2FAEnabled(false);
        setSnackbar({
          open: true, 
          message: '2FA disabled successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        setSnackbar({
          open: true,
          message: 'Error disabling 2FA',
          severity: 'error'
        });
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please enter the verification code from your authenticator app',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await UserService.verify2FA(secret, verificationCode);
      console.log("Verification response:", response);
      
      if (response.data.message) {
        setIs2FAEnabled(true);
        setShowQRDialog(false);
        setVerificationCode('');
        setSnackbar({
          open: true,
          message: '2FA enabled successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Invalid verification code',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error verifying 2FA code',
        severity: 'error'
      });
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Reset fields to current values when entering edit mode
      setUsername(user.username);
      setEmail(user.email);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await UserService.updateProfile(username, email);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      // Update user info in context
      if (user) {
        const updatedUser = { ...user, username, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Reload to update the user context
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating profile information',
        severity: 'error'
      });
    }
  };

  const handleOpenQRDialog = () => {
    if (!is2FAEnabled) {
      setLoadingQR(true);
      UserService.generate2FASecret()
        .then((response) => {
          console.log("QR Code received:", response.data.qrCode);
          setQrCode(response.data.qrCode);
          setSecret(response.data.secret);
          setOpen2FADialog(true);
          setLoadingQR(false);
        })
        .catch((error) => {
          console.error("Error generating 2FA secret:", error);
          setSnackbarMessage("Error generating QR code. Please try again.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setLoadingQR(false);
        });
    } else {
      // If 2FA is already enabled, confirm that they want to disable it
      setDisabling2FA(true);
    }
  };

  const handleCloseQRDialog = () => {
    setOpen2FADialog(false);
    setVerificationCode("");
    setVerificationError("");
  };

  const handleVerificationCodeChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setVerificationCode(value);
      setVerificationError("");
    }
  };

  const handleDisable2FA = () => {
    setDisabling2FA(true);
    UserService.disable2FA()
      .then((response) => {
        setIs2FAEnabled(false);
        setDisabling2FA(false);
        setSnackbarMessage("Two-factor authentication disabled successfully!");
        setSnackbarSeverity("info");
        setOpenSnackbar(true);
        // Update the user's authentication status
        const user = AuthService.getCurrentUser();
        if (user) {
          user.mfaEnabled = false;
          localStorage.setItem("user", JSON.stringify(user));
        }
      })
      .catch((error) => {
        console.error("Error disabling 2FA:", error);
        setSnackbarMessage("Error disabling two-factor authentication. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        setDisabling2FA(false);
      });
  };

  const handleCancelDisable2FA = () => {
    setDisabling2FA(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Loading your profile...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait while we fetch your information</Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, maxWidth: 400, border: '1px solid #E6E6E6' }}>
          <Typography variant="h5" gutterBottom>Sign in to view your profile</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to access your profile settings
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, px: 4, py: 1.2 }} 
            onClick={() => navigate('/login')}
            size="large"
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: {xs: 2, md: 4}, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Your Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Manage your account settings and security preferences
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* User Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ 
            height: '100%', 
            border: '1px solid #E6E6E6',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Account Information</Typography>
                </Box>
              }
              action={
                <IconButton 
                  onClick={handleEditToggle}
                  color={editMode ? "secondary" : "default"}
                  sx={{ 
                    border: editMode ? '1px solid' : 'none', 
                    borderColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: editMode ? 'rgba(3, 168, 124, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {editMode ? <CancelIcon /> : <EditIcon />}
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: 'secondary.main',
                    fontSize: '2.5rem',
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(3, 168, 124, 0.3)'
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                
                <Typography variant="subtitle1" gutterBottom>
                  Member since {new Date().getFullYear()}
                </Typography>
              </Box>
              
              <Box sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                  <AccountCircleIcon sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Username
                    </Typography>
                    <TextField
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      size="small"
                      sx={{
                        '& .MuiFilledInput-root': {
                          borderRadius: 1,
                          bgcolor: editMode ? 'transparent' : '#f5f8fa',
                          '&:before, &:after': {
                            display: 'none'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                  <EmailIcon sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editMode}
                      variant={editMode ? "outlined" : "filled"}
                      size="small"
                      sx={{
                        '& .MuiFilledInput-root': {
                          borderRadius: 1,
                          bgcolor: editMode ? 'transparent' : '#f5f8fa',
                          '&:before, &:after': {
                            display: 'none'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                {editMode && (
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    sx={{ mt: 2, py: 1.2 }}
                  >
                    Save Changes
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Security Settings Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ 
            height: '100%', 
            border: '1px solid #E6E6E6',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mb: 4, 
                p: 3,
                bgcolor: is2FAEnabled ? 'rgba(3, 168, 124, 0.08)' : '#f5f8fa',
                borderRadius: 2
              }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    mb: 2,
                    bgcolor: is2FAEnabled ? 'secondary.main' : 'rgba(0, 0, 0, 0.12)'
                  }}
                >
                  {is2FAEnabled ? <VerifiedUserIcon /> : <NoEncryptionIcon />}
                </Avatar>
                
                <Chip 
                  label={is2FAEnabled ? "2FA Enabled" : "2FA Disabled"}
                  color={is2FAEnabled ? "secondary" : "default"}
                  variant={is2FAEnabled ? "filled" : "outlined"}
                  icon={is2FAEnabled ? <VerifiedUserIcon /> : <NoEncryptionIcon />}
                  sx={{ mb: 2, px: 1 }}
                />
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                  {is2FAEnabled 
                    ? "Your account is protected with two-factor authentication." 
                    : "Your account is not protected with two-factor authentication."}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  {is2FAEnabled 
                    ? "Each time you log in, you'll need to enter a verification code from your authenticator app." 
                    : "Enable 2FA to add an extra layer of security to your account."}
                </Typography>
                
                <Button
                  variant={is2FAEnabled ? "outlined" : "contained"}
                  color={is2FAEnabled ? "primary" : "secondary"}
                  onClick={handleOpenQRDialog}
                  sx={{ 
                    minWidth: 200,
                    py: 1
                  }}
                >
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                About Two-Factor Authentication
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Two-factor authentication adds an extra layer of security to your account by requiring both your password and a verification code from your authenticator app when signing in.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                This helps protect your account even if your password is compromised, as attackers would still need access to your authenticator app to log in.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2FA Dialog */}
      <Dialog 
        open={open2FADialog} 
        onClose={handleCloseQRDialog}
        maxWidth="sm"
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
          Set up Two-Factor Authentication
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
              1. Scan this QR code with your authenticator app
            </Typography>
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              bgcolor: '#f8f9fa',
              width: 'fit-content',
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {qrCode ? (
                <>
                  <QrCodeIcon sx={{ mb: 2, color: 'secondary.main', fontSize: '2rem' }} />
                  <img 
                    src={qrCode} 
                    alt="QR Code for 2FA" 
                    style={{ width: 200, height: 200 }} 
                  />
                </>
              ) : (
                <Box sx={{ width: 200, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Loading QR code...</Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ 
              mb: 4, 
              p: 3,
              border: '1px solid rgba(3, 168, 124, 0.3)',
              borderRadius: 2,
              bgcolor: 'rgba(3, 168, 124, 0.05)',
              width: '100%'
            }}>
              <Typography variant="subtitle2" gutterBottom color="secondary.main">
                Manual Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                If you can't scan the QR code, enter this secret key manually in your authenticator app:
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, fontFamily: 'monospace', wordBreak: 'break-all', border: '1px solid #e0e0e0' }}>
                {secret}
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              2. Enter the verification code from your app
            </Typography>
            <TextField
              label="6-digit verification code"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              fullWidth
              autoFocus
              variant="outlined"
              margin="normal"
              inputProps={{ 
                maxLength: 6, 
                style: { letterSpacing: '0.5em', textAlign: 'center' },
                inputMode: 'numeric', 
                pattern: '[0-9]*' 
              }}
              placeholder="000000"
              sx={{ maxWidth: 300 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleCloseQRDialog}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify2FA} 
            variant="contained" 
            color="secondary"
            sx={{ px: 3 }}
          >
            Verify and Enable
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Disable 2FA Confirmation Dialog */}
      <Dialog open={disabling2FA} onClose={handleCancelDisable2FA}>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'error.main' 
        }}>
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          Disable Two-Factor Authentication?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Disabling two-factor authentication will reduce the security of your account. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCancelDisable2FA} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDisable2FA} variant="outlined" color="error">
            Disable 2FA
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 