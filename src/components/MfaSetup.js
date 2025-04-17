import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert, Spinner, Card, Form, Row, Col, InputGroup } from 'react-bootstrap';

const MfaSetup = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const fetchMfaStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/mfa/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMfaEnabled(response.data.enabled);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching MFA status', err);
      setError('Failed to load MFA status');
      setLoading(false);
    }
  };

  const handleSetupMfa = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.get('/api/mfa/setup', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setSetupMode(true);
      setLoading(false);
    } catch (err) {
      console.error('Error setting up MFA', err);
      setError('Failed to setup MFA. Please try again.');
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post(
        '/api/mfa/enable',
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setMfaEnabled(true);
        setSetupMode(false);
        setSuccess('Two-factor authentication has been enabled successfully');
        setVerificationCode('');
      } else {
        setError(response.data.message || 'Failed to verify code');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error enabling MFA', err);
      setError('Failed to enable MFA. Please check your verification code and try again.');
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post(
        '/api/mfa/disable',
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setMfaEnabled(false);
        setSuccess('Two-factor authentication has been disabled');
        setVerificationCode('');
      } else {
        setError(response.data.message || 'Failed to verify code');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error disabling MFA', err);
      setError('Failed to disable MFA. Please check your verification code and try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {!setupMode && !mfaEnabled && (
        <div>
          <p>Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to enter a verification code from your phone each time you sign in.</p>
          <Button 
            variant="primary" 
            onClick={handleSetupMfa} 
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Set Up Two-Factor Authentication'}
          </Button>
        </div>
      )}
      
      {setupMode && !mfaEnabled && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Set Up Two-Factor Authentication</h5>
            <p>1. Scan this QR code with your authenticator app (like Google Authenticator)</p>
            
            <div className="text-center mb-3">
              {qrCode && <img src={qrCode} alt="QR Code for 2FA Setup" className="img-fluid" />}
            </div>
            
            <p>2. Or manually enter this key in your app:</p>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                value={secret}
                readOnly
                className="font-monospace"
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => navigator.clipboard.writeText(secret)}
              >
                Copy
              </Button>
            </InputGroup>
            
            <p>3. Enter the verification code from your app:</p>
            <Form onSubmit={handleEnableMfa}>
              <Form.Group as={Row} className="mb-3">
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                    pattern="[0-9]{6}"
                  />
                </Col>
                <Col sm={6}>
                  <div className="d-grid gap-2 d-md-flex">
                    <Button 
                      type="submit" 
                      variant="success" 
                      disabled={loading}
                    >
                      {loading ? <Spinner animation="border" size="sm" /> : 'Verify & Enable'}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSetupMode(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {mfaEnabled && (
        <div>
          <Alert variant="info">
            Two-factor authentication is enabled for your account.
          </Alert>
          
          <Form onSubmit={handleDisableMfa}>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>Verification Code:</Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  pattern="[0-9]{6}"
                />
              </Col>
              <Col sm={4}>
                <Button 
                  type="submit" 
                  variant="danger" 
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Disable Two-Factor Authentication'}
                </Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
      )}
    </div>
  );
};

export default MfaSetup; 