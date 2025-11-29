import React, { useState, useEffect } from 'react';
import './login.css';
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('email'); // email, otp, password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a reset token in URL (old method)
    const token = searchParams.get('token');
    if (token) {
      // This is the old method - redirect to forgot password
      setError('This reset link uses the old method. Please use the forgot password page instead.');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000);
    }
  }, [searchParams, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/guest/send-password-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('otp');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/guest/verify-password-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTempToken(data.tempToken);
        setStep('password');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/guest/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error && error.includes('old method')) {
    return (
      <div className='login'>
        <div className='login-container'>
          <div className='left-panel' style={{ backgroundImage: `url(${loginImage})` }}></div>
          <div className='right-panel'>
            <div className='login-box'>
              <div className='logo-section'>
                <img src={logoImage} alt='Logo' />
                <h1>LODGIX</h1>
              </div>
              <h2>Outdated Reset Link</h2>
              <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
                This password reset link uses an old method. You'll be redirected to the forgot password page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='login'>
      <div className='login-container'>
        <div className='left-panel' style={{ backgroundImage: `url(${loginImage})` }}></div>
        <div className='right-panel'>
          <div className='login-box'>
            <div className='logo-section'>
              <img src={logoImage} alt='Logo' />
              <h1>LODGIX</h1>
            </div>

            {step === 'email' && (
              <>
                <h2>Reset Your Password</h2>
                <p>Enter your email address and we'll send you a verification code</p>
              </>
            )}

            {step === 'otp' && (
              <>
                <h2>Enter Verification Code</h2>
                <p>We've sent a 6-digit code to <strong>{email}</strong></p>
              </>
            )}

            {step === 'password' && (
              <>
                <h2>Set New Password</h2>
                <p>Enter your new password below</p>
              </>
            )}

            {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

            {step === 'email' && (
              <form onSubmit={handleSendOTP}>
                <div className='form-group'>
                  <input
                    type='email'
                    placeholder='Email Address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button type='submit' disabled={loading}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <br />
                <br />
                <hr className='line' /> OR <hr className='line' />

                <button type='button' onClick={() => navigate('/login')}>
                  Back to Login
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP}>
                <div className='form-group'>
                  <input
                    type='text'
                    placeholder='6-digit code'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
                  />
                </div>

                <button type='submit' disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <br />
                <br />
                <hr className='line' /> OR <hr className='line' />

                <button type='button' onClick={() => setStep('email')}>
                  Back
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword}>
                <div className='form-group'>
                  <input
                    type='password'
                    placeholder='New Password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className='form-group'>
                  <input
                    type='password'
                    placeholder='Confirm New Password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button type='submit' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>

                <br />
                <br />
                <hr className='line' /> OR <hr className='line' />

                <button type='button' onClick={() => navigate('/login')}>
                  Back to Login
                </button>
              </form>
            )}

            <div className='create-account'>
              Don't have an account?{' '}
              <button
                type='button'
                onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', color: '#b8860b', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
