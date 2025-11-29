import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './email.css';

const EmailChange = ({ currentEmail, onEmailUpdate, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email form, 2: OTP verification, 3: Success
  const [formData, setFormData] = useState({
    currentEmail: '',
    newEmail: '',
    currentPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentEmail) {
      setFormData(prev => ({
        ...prev,
        currentEmail: currentEmail,
        newEmail: currentEmail
      }));
    }
  }, [currentEmail]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // Step 1: Request email change using same signup OTP
  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();
  
    if (!formData.currentEmail || !formData.newEmail || !formData.currentPassword) {
      setError('Please fill in all fields');
      return;
    }
  
    if (formData.currentEmail !== currentEmail) {
      setError('Current email does not match your account email');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
  
    if (formData.currentEmail === formData.newEmail) {
      setError('New email must be different from current email');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const token = localStorage.getItem('token'); // ✅ define it here
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
  
      const response = await fetch('http://localhost:3000/api/guest/change-email/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEmail: formData.newEmail,
        }),
      });
  
      const data = await response.json();
      console.log('API Response (OTP Request):', data);
  
      if (response.ok) {
        setSuccess('Verification code sent to your new email address');
        setCurrentStep(2);
        startResendCooldown();
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
  
  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token'); // ✅ get token from localStorage

      // ✅ Use the email change verification endpoint
      const response = await fetch("http://localhost:3000/api/guest/change-email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.newEmail,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setSuccess("Email changed successfully!");
        setTimeout(() => navigate('/profile'), 2000); // Redirect to profile after 2 seconds
      } else {
        setError(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("❌ Error verifying email change:", error);
      setError("Something went wrong. Please try again later.");
    }

  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      // ✅ Use the email change resend OTP endpoint
      const response = await fetch('http://localhost:3000/api/guest/change-email/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: formData.newEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Verification code resent to your email');
        startResendCooldown();
      } else {
        setError(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="email-change-container">
      <div className="email-change-header">
        <h2>Change Email Address</h2>
        <p>Update your email address for account notifications and security</p>
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

      {currentStep === 1 && (
        <form onSubmit={handleEmailChangeRequest} className="email-form">
          <div className="form-group">
            <label htmlFor="currentEmail">Current Email *</label>
            <input
              type="email"
              id="currentEmail"
              name="currentEmail"
              value={formData.currentEmail}
              onChange={handleInputChange}
              placeholder="Enter your current email"
              disabled={loading}
              required
            />
            <small className="form-help">This should match your current account email</small>
          </div>

          <div className="form-group">
            <label htmlFor="newEmail">New Email Address *</label>
            <input
              type="email"
              id="newEmail"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleInputChange}
              placeholder="Enter your new email address"
              disabled={loading}
              required
            />
          </div>

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
            <small className="form-help">Enter your current password to verify the change</small>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading || !formData.currentEmail || !formData.newEmail || !formData.currentPassword}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>

          {onCancel && (
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleOtpVerification} className="otp-form">
          <div className="verification-info">
            <p>We've sent a verification code to <strong>{formData.newEmail}</strong></p>
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
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || loading}
          >
            {resendCooldown > 0
              ? `Resend in ${formatCooldown(resendCooldown)}`
              : 'Resend Code'}
          </button>
        </form>
      )}

      {currentStep === 3 && (
        <div className="success-state">
          <div className="success-icon-large">✓</div>
          <h3>Email Changed Successfully!</h3>
          <p>Your email address has been updated to <strong>{formData.newEmail}</strong></p>
          <p>You can close this form now.</p>
          {onCancel && (
            <button
              className="primary-btn"
              onClick={onCancel}
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              Close
            </button>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <button
          type="button"
          className="back-btn"
          onClick={() => setCurrentStep(1)}
          disabled={loading}
        >
          ← Back to Email Form
        </button>
      )}
    </div>
  );
};

export default EmailChange;
