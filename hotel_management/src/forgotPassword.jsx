import React, { useState } from 'react';
import './login.css';
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/guest/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
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
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password</p>

            {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '20px' }}>{message}</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <br />
              <br />
              <hr className='line' /> OR <hr className='line' />

              <button type='button' onClick={() => navigate('/login')}>
                Back to Login
              </button>

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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
