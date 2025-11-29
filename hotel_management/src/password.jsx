import React, { useState, useEffect } from 'react';

const PasswordChange = ({ onPasswordUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  }); // ✅ FIXED: Added missing state

  const [step, setStep] = useState(1); // 1: Password form, 2: OTP verification
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Send request with both current and new password
      const response = await fetch('http://localhost:3000/api/guest/change-password/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      let data;
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

      if (response.ok) {
        setSuccess('Verification code sent to your email');
        setStep(2);
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/guest/change-password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          otp: formData.otp
        }),
      });

      let data;
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

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
          onPasswordUpdate();
        }, 1500);
      } else {
        setError(data.message || 'Failed to verify code');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testToken = async () => {
    const token = localStorage.getItem('token');
    console.log('Stored token:', token ? `${token.substring(0, 50)}...` : 'No token');

    try {
      const response = await fetch('http://localhost:3000/api/guest/debug-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Debug response:', data);
      alert(`Debug info: ${JSON.stringify(data.data, null, 2)}`);
    } catch (error) {
      console.error('Debug request failed:', error);
      alert(`Debug failed: ${error.message}`);
    }
  };

  return (
    <div className="password-change-container">
      <div className="password-change-header">
        <h2>Change Password</h2>
        <p>Update your password to keep your account secure</p>
      </div>

      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password *</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password *</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password (min 6 characters)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="otp-form">
          <div className="verification-info">
            <p>We've sent a verification code to your email address.</p>
            <p>Please enter the 6-digit code below:</p>
          </div>

          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              maxLength="6"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading || formData.otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Update Password'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Back to Password Form
          </button>
        </form>
      )}
    </div>
  );
};

export default PasswordChange;
