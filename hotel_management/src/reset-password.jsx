import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css'; // Using login.css for consistent styling

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/guest/reset-password', {
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword
      });

      setMessage(response.data.message || 'Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='login'>
        <div className='login-container'>
          <div className='left-panel'></div>
          <div className='right-panel'>
            <div className='login-box'>
              <div className='logo-section'>
                <h1>LODGIX</h1>
              </div>
              <h2>Invalid Reset Link</h2>
              <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
              <button 
                type='button' 
                onClick={() => navigate('/forgot-password')}
                style={{ marginTop: '20px' }}
              >
                Request New Reset Link
              </button>
              <button 
                type='button' 
                onClick={() => navigate('/login')}
                style={{ marginTop: '10px', background: 'none', color: '#b8860b' }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='login'>
      <div className='login-container'>
        <div className='left-panel'></div>
        <div className='right-panel'>
          <div className='login-box'>
            <div className='logo-section'>
              <h1>LODGIX</h1>
            </div>
            <h2>Reset Your Password</h2>
            <p>Enter your new password below</p>

            {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <input
                  type='password'
                  name='password'
                  placeholder='New Password'
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || !!message}
                  required
                />
              </div>
              <div className='form-group'>
                <input
                  type='password'
                  name='confirmPassword'
                  placeholder='Confirm New Password'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || !!message}
                  required
                />
              </div>

              <button 
                type='submit' 
                disabled={loading || !!message}
                style={{ marginTop: '20px' }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className='create-account' style={{ marginTop: '20px' }}>
                Remembered your password?{' '}
                <button
                  type='button'
                  onClick={() => navigate('/login')}
                  style={{ background: 'none', border: 'none', color: '#b8860b', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Log in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
