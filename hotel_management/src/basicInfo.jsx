import React, { useState, useRef, useEffect } from 'react';
import './basicInfo.css';
import loginImage from './assets/loginimage.png';
import logoImage from './assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

// Country codes data
const countryCodes = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' }
];

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    id_document: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default to US
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Get email from previous step
  const email = location.state?.email || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Phone number formatting
    if (name === 'phone_number') {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData({ ...formData, [name]: formattedValue });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    // Return the phone number as is (no formatting)
    return phoneNumber;
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    // Clear phone number when country changes
    setFormData({ ...formData, phone_number: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setFieldErrors({ ...fieldErrors, id_document: 'Please upload a valid image (JPG, PNG) or PDF file' });
      return;
    }

    if (file.size > maxSize) {
      setFieldErrors({ ...fieldErrors, id_document: 'File size must be less than 5MB' });
      return;
    }

    setFormData({ ...formData, id_document: file });
    setFieldErrors({ ...fieldErrors, id_document: null });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, id_document: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (formData.phone_number.replace(/\D/g, '').length < 13) {
      errors.phone_number = 'Please enter a valid 13-digit phone number';
    }

    if (!formData.id_document) {
      errors.id_document = 'ID document is required';
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

    if (!email) {
      setError('Email not found. Please start signup process again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', email);
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('id_document', formData.id_document);

      const response = await fetch('http://localhost:3000/users/guests/basic-info', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration completed successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="basic-info-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={loginImage} alt="Hotel" className="login-image" />
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="logo-container">
              <img src={logoImage} alt="Lodgix Logo" className="logo" />
              <h2>LODGIX</h2>
            </div>

            <div className="progress-indicator">
              <div className="progress-step completed"></div>
              <div className="progress-line completed"></div>
              <div className="progress-step completed"></div>
              <div className="progress-line completed"></div>
              <div className="progress-step active"></div>
            </div>

            <div className="welcome-text">
              <h3>Complete Your Profile</h3>
              <p>Please provide your basic information to complete registration</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  style={fieldErrors.full_name ? { borderColor: '#e53e3e' } : {}}
                />
                {fieldErrors.full_name && (
                  <small style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.full_name}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number *</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  style={fieldErrors.phone_number ? { borderColor: '#e53e3e' } : {}}
                />
                {fieldErrors.phone_number && (
                  <small style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {fieldErrors.phone_number}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address (optional)"
                  disabled={isLoading}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="id_document">ID Document *</label>
                <div className="file-upload-container">
                  <div
                    className={`file-upload-area ${dragOver ? 'dragover' : ''}`}
                    onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={fieldErrors.id_document ? { borderColor: '#e53e3e' } : {}}
                  >
                    <div className="file-upload-icon">📄</div>
                    <div className="file-upload-text">
                      {formData.id_document ? 'Click to change file' : 'Click to upload or drag and drop'}
                    </div>
                    <div className="file-upload-subtext">JPG, PNG or PDF (max 5MB)</div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    id="id_document"
                    name="id_document"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    disabled={isLoading}
                    className="file-input-hidden"
                  />

                  {formData.id_document && (
                    <div className="file-preview">
                      <span className="file-preview-icon">📎</span>
                      <span className="file-preview-name">{formData.id_document.name}</span>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={removeFile}
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {fieldErrors.id_document && (
                    <small style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.id_document}
                    </small>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading && <span className="loading-spinner"></span>}
                {isLoading ? 'Completing Registration...' : 'Complete Registration'}
              </button>
            </form>

            <div className="signup-link">
              <p>Already have an account? <a href="/">Sign In</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;