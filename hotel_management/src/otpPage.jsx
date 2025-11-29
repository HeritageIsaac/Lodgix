import React, { useState, useEffect } from 'react';
import './login.css'; // Reuse existing styles
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';

const OtpPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(30); // 30-second timer
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let timer;
    if (resendTimer > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendTimer, isResendDisabled]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      // Simulate API call to verify OTP
      console.log('Verifying OTP:', otpValue);
      setError(null);
      // Replace with actual API call: fetch('/api/verify-otp', { method: 'POST', body: JSON.stringify({ otp: otpValue }) })
    } else {
      setError('Please enter a 6-digit OTP');
    }
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(''));
    setResendTimer(30);
    setIsResendDisabled(true);
    // Simulate resend API call
    console.log('Resending OTP...');
    // Replace with actual API call: fetch('/api/resend-otp', { method: 'POST' })
  };

  return (
    <div className="login-container">
      <div className="left-panel" style={{ backgroundImage: `url(${loginImage})` }}>
        {/* Background image */}
      </div>
      <div className="right-panel">
        <div className="login-box">
          <div className="logo-section">
            <img src={logoImage} alt="Logo" />
            <h1>LODGIX</h1>
          </div>
          <h2>Verify Your OTP</h2>
          <p>Please enter the 6-digit code sent to your email</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit} className="otp-form">
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <button type="submit" className="mt-4">Verify OTP</button>
            <p className="text-center mt-4">
              Didn’t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled}
                className="resend-button"
              >
                Resend OTP {isResendDisabled && `(${resendTimer}s)`}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;