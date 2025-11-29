import React, { useState } from 'react';
import './login.css';
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {
  const [guest, setGuest] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuest({ ...guest, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guest.email || !guest.password) {
      setError('Please fill all fields');
      return;
    }

    try {
      console.log('Attempting login with:', { email: guest.email });
      const response = await fetch('http://localhost:3000/api/guest/login', {
        method: 'POST',
        credentials: 'include', // This is important for sending cookies
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(guest),
      });


      console.log('Response status:', response.status);
      let data;

      if (response.status === 204 || response.status === 205) {
        // Handle No Content responses
        data = { message: 'Login successful but no data returned' };
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Handle non-JSON responses (plain text, HTML, etc.)
          const textResponse = await response.text();
          console.error('Non-JSON response from server:', textResponse);
          setError(`Server error (${response.status}): ${textResponse || 'Unknown error'}`);
          return;
        }
      }

      console.log('Response data:', data);

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      setError(null);
      console.log('Login Success:', data);

      // Store token and user data
      if (data.data && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.guest));
        // Store email for booking page to retrieve
        localStorage.setItem("userEmail", guest.email);
        // Store guest_id for bookings and notifications
        localStorage.setItem("guestId", data.data.guest.id);
        console.log('Email stored in localStorage:', guest.email);
        console.log('Guest ID stored in localStorage:', data.data.guest.id);

        // Check if there's a redirect URL stored
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin"); // Clear the stored redirect
          navigate(redirectPath); // Redirect to the originally requested page
        } else {
          navigate("/dashboard"); // Default redirect to dashboard
        }
      }

    } catch (error) {
      console.error('Login failed:', error);
      setError('Network error. Please check if the server is running.');
    }
  };

  return (
    <div className='login'>
      <div className='login-container'>
        <div className='left-panel' style={{ backgroundImage: `url(${loginImage})` }}></div>
        <div className='right-panel'>
          <div className='login-box'>
            <div className='logo-section' style={{ marginTop: '100px' }}>
              <img src={logoImage} alt='Logo' />
              <h1>LODGIX</h1>
            </div>
            <h2>Log in to your account</h2>
            <p>Welcome back</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <input
                  type='email'
                  name='email'
                  placeholder='Email'
                  value={guest.email}
                  onChange={handleChange}
                />
              </div>
              <div className='form-group'>
                <input
                  type='password'
                  name='password'
                  placeholder='Password'
                  value={guest.password}
                  onChange={handleChange}
                />
              </div>
              <div className='forgot-password'>
                <button type='button' onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: '#b8860b', cursor: 'pointer', textDecoration: 'underline' }}>
                  Forgot password?
                </button>
              </div>
              <button type='submit'>Log in</button> <br />
              <br />
              <hr className='line' /> OR <hr className='line' />
              <button type='button' onClick={() => navigate('/signup')}>
                Create Account
              </button>
              <div className='create-account'>
                By continuing, you agree to our <br />
                <a href='#'>Terms of Service</a> <a href='#'>Privacy Policy</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
