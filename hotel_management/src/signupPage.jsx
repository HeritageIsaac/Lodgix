import React, { useState, useEffect } from 'react';
import './login.css';
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [guest, setGuest] = useState({ email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: signup, 2: verify OTP
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuest({ ...guest, [name]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
    
    // Clear confirm password error when password changes
    if (name === 'password' && fieldErrors.confirmPassword) {
      setFieldErrors({ ...fieldErrors, confirmPassword: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!guest.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guest.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!guest.password) {
      errors.password = 'Password is required';
    } else if (guest.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!guest.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (guest.password !== guest.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please correct the errors below');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Send only email and password to backend (exclude confirmPassword)
      const { confirmPassword, ...guestData } = guest;
      const response = await fetch('http://localhost:3000/users/guest', {  
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Sign Up failed');
        return;
      }

      setError(null);
      setSuccess('Signup successful! Please check your email for the verification code.');
      setStep(2); // Move to OTP verification step
    } catch (error) {
      console.error('Sign Up failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/users/guests/verify-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guest.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Verification failed');
        return;
      }

      setError(null);
      setSuccess('Email verified successfully! Please complete your profile.');
      // Store email in localStorage for booking page to retrieve
      localStorage.setItem('userEmail', guest.email);
      console.log('Email stored in localStorage:', guest.email);
      // Redirect to basic info page after successful verification
      setTimeout(() => navigate('/basic-info', { state: { email: guest.email } }), 2000);
    } catch (error) {
      console.error('Verification failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/users/guests/resend-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guest.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend code');
        return;
      }

      setSuccess('Verification code resent to your email');
    } catch (error) {
      console.error('Resend failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
            {step === 1 ? (
              <>
                <h2 className='create'>Create an Account</h2>
                {error && <p className='error-message'>{error}</p>}
                {success && <p className='success-message'>{success}</p>}
                <form onSubmit={handleSubmit}>
                  <div className='form-group'>
                    <input
                      type='email'
                      name='email'
                      placeholder='Email'
                      value={guest.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={fieldErrors.email ? 'input-error' : ''}
                    />
                    {fieldErrors.email && <small className='error-text'>{fieldErrors.email}</small>}
                  </div>
                  <div className='form-group'>
                    <input
                      type='password'
                      name='password'
                      placeholder='Password (min 6 characters)'
                      value={guest.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={fieldErrors.password ? 'input-error' : ''}
                    />
                    {fieldErrors.password && <small className='error-text'>{fieldErrors.password}</small>}
                  </div>
                  <div className='form-group'>
                    <input
                      type='password'
                      name='confirmPassword'
                      placeholder='Confirm Password'
                      value={guest.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={fieldErrors.confirmPassword ? 'input-error' : ''}
                    />
                    {fieldErrors.confirmPassword && (
                      <small className='error-text'>{fieldErrors.confirmPassword}</small>
                    )}
                  </div>
                  <button type='submit' disabled={isLoading}>
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                  </button>
                  <br />
                  <br />
                  <hr className='line' /> OR <hr className='line' />
                  <button type='button' onClick={() => navigate('/')}>
                    Login
                  </button>
                  <div className='create-account'>
                    By continuing, you agree to our <br />
                    <a href='#'>Terms of Service</a> <a href='#'>Privacy Policy</a>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className='create'>Verify Your Email</h2>
                <p>
                  We've sent a verification code to <strong>{guest.email}</strong>
                </p>
                {error && <p className='error-message'>{error}</p>}
                {success && <p className='success-message'>{success}</p>}
                <form className='otp-form' onSubmit={handleOtpVerification}>
                  <div className='form-group'>
                    <input
                      type='text'
                      placeholder='Enter 6-digit verification code'
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength='6'
                      disabled={isLoading}
                    />
                  </div>
                  <button type='submit' disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <br />
                  <br />
                  <button type='button' onClick={handleResendOtp} disabled={isLoading} className='resend-button'>
                    Resend Code
                  </button>
                  <br />
                  <button type='button' onClick={() => setStep(1)} className='back-button'>
                    Back to Sign Up
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
