import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // Check if user is already logged in and has a valid token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        // Only redirect if the token exists and user has admin role
        if (user.role === 'admin') {
          // Verify token is not expired (you can add more robust token validation here)
          const tokenExpiration = user.exp || 0;
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (tokenExpiration > currentTime) {
            navigate('/admin/dashboard');
          } else {
            // Clear expired token
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            toast.info('Your session has expired. Please log in again.');
          }
        } else {
          // Clear non-admin user data
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData.email);
      // Authenticate the user
      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include', // This is required for cookies to be sent
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      console.log('Login response status:', loginResponse.status);
      
      // Handle non-OK responses
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const responseData = await loginResponse.json();
      console.log('Login successful, response:', responseData);
      
      if (!responseData.data || !responseData.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user } = responseData.data;

      // Verify the user has admin role (case-insensitive check)
      if (!user.role || user.role.toLowerCase() !== 'admin') {
        throw new Error('This account does not have admin privileges. Please contact support.');
      }

      // Store user data and token in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      console.log('Login successful, storing data and redirecting...');
      
      // Store user data and token in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      // Show success message
      toast.success('Admin login successful!', {
        position: 'top-center',
        autoClose: 1000
      });
      
      // Redirect after a short delay to ensure the toast is visible
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/admin/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err.message || 'Invalid credentials or not authorized';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-left">
          <div className="logo">
            <h1>LODGIX</h1>
            <p>Hotel Management System</p>
          </div>
          <div className="login-illustration">
            <img
              src="https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg"
              alt="Admin Login"
            />
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <h2>Admin Login</h2>
            <p className="welcome-text">
              Welcome back! Please login to your account.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password">Password</label>
                  <a href="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="login-footer">
              <p>© {new Date().getFullYear()} LODGIX. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
