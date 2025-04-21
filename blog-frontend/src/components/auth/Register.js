import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Alert, 
  Avatar, 
  Fade, 
  CircularProgress, 
  Card, 
  Stack, 
  useTheme,
  alpha
} from '@mui/material';
import AuthService from '../../services/auth.service';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    setSuccessful(false);
    setLoading(true);

    if (!username || !email || !password) {
      setMessage('All fields are required!');
      setLoading(false);
      return;
    }

    AuthService.register(username, email, password).then(
      (response) => {
        setMessage(response.data.message || 'Registration successful! Redirecting to login...');
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      }
    );
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
                  backgroundColor: 'secondary.main',
                  boxShadow: '0 8px 16px rgba(247, 37, 133, 0.2)',
                  transform: 'translateY(-50%)',
                  position: 'absolute',
                  top: 0
                }}
              >
                <PersonAddAltIcon fontSize="large" />
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
                  Create Account
                </Typography>
                <Typography 
                  variant="body1" 
                  align="center" 
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Sign up to get started with ProContent
                </Typography>
              </Box>
            </Box>

            {message && (
              <Alert 
                severity={successful ? "success" : "error"} 
                icon={successful ? <CheckCircleOutlineIcon fontSize="inherit" /> : <ErrorOutlineIcon fontSize="inherit" />}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: successful 
                    ? '0 4px 12px rgba(16, 185, 129, 0.1)' 
                    : '0 4px 12px rgba(239, 68, 68, 0.1)'
                }}
              >
                {message}
              </Alert>
            )}

            <form onSubmit={handleRegister}>
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
                  disabled={successful}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={successful}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={successful}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={loading || successful}
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
                    'Sign Up'
                  )}
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register; 