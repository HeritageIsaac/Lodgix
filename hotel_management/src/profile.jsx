import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaBed, FaCamera, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaBell, FaLock, FaTrash, FaBan } from 'react-icons/fa';
import { MdOutlineDashboard, MdOutlineHotel, MdOutlineAttachMoney, MdPerson, MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdLanguage, MdPayment, MdSecurity, MdDelete, MdWarning, MdOutlineLogout } from "react-icons/md";
import { hotels } from './dummyData';
import EmailChange from './email.jsx';
import PasswordChange from './password.jsx';
import './password.css';

function Profile() {
  const navigate = useNavigate();

  // User profile state - load from localStorage initially
  const [userProfile, setUserProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    profilePicture: null,
    address: '',
    dateOfBirth: '',
    gender: '',
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
    joinDate: '',
    lastLogin: '',
    lastLoginLocation: 'Unknown Location'
  });

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Personal details editing state
  const [editingPersonalDetails, setEditingPersonalDetails] = useState(false);
  const [personalDetailsChanges, setPersonalDetailsChanges] = useState({});
  const [savingPersonalDetails, setSavingPersonalDetails] = useState(false);

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Handle email update after successful change
  const handleEmailUpdate = (newEmail) => {
    setUserProfile(prev => ({ ...prev, email: newEmail }));
    localStorage.setItem('userEmail', newEmail);
    setShowEmailChange(false);
    // Optionally reload user data to sync with database
    loadUserData();
  };

  // Handle password update after successful change
  const handlePasswordUpdate = () => {
    setShowPasswordChange(false);
    // Optionally show a success message or reload data
  };

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from localStorage and API
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // First, try to get user email from localStorage (from login)
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Load basic data from localStorage for immediate display
      const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const savedProfile = localStorage.getItem('userProfile');

      setFavorites(savedFavorites);
      setBookings(savedBookings);

      // Get recent bookings (last 3)
      const recent = savedBookings.slice(-3).reverse();
      setRecentBookings(recent);

      // Set email from localStorage
      setUserProfile(prev => ({ ...prev, email: userEmail }));

      // Try to load existing profile from localStorage
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          setUserProfile(prev => ({ ...prev, ...profileData }));
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      }

      // Fetch complete profile from API
      await fetchUserProfile(userEmail);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile from API
  const fetchUserProfile = async (email) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/guest/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();

        // Update state with API data
        setUserProfile(prev => ({
          ...prev,
          ...profileData.data, // Use the data field from the API response
          email: email // Keep email from localStorage as it's the primary identifier
        }));

        // Save to localStorage for offline access
        localStorage.setItem('userProfile', JSON.stringify({
          ...profileData.data, // Use the data field from the API response
          email: email
        }));

      } else if (response.status === 404) {
        // Profile doesn't exist, create default profile
        await createDefaultProfile(email);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile data');
    }
  };

  // Create default profile for new users
  const createDefaultProfile = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const defaultProfile = {
        name: email.split('@')[0], // Use email username as default name
        username: email.split('@')[0],
        email: email,
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        preferredLanguage: 'en',
        preferredCurrency: 'INR',
        joinDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`http://localhost:3000/api/guest/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(defaultProfile)
      });

      if (response.ok) {
        const newProfile = await response.json();
        setUserProfile(prev => ({ ...prev, ...newProfile.data }));
        localStorage.setItem('userProfile', JSON.stringify(newProfile.data));
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile');
    }
  };

  // Handle profile updates for immediate UI feedback
  const handleProfileUpdate = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  // Update profile field in database
  const updateProfileField = async (field, value) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Handle empty date values
      if (field === 'dateOfBirth' && (!value || value === '')) {
        value = null;
      }

      const updateData = { [field]: value };

      const response = await fetch(`http://localhost:3000/api/guest/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(prev => ({ ...prev, ...updatedProfile.data }));
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile.data));
        return true;
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      return false;
    }
  };

  // Handle personal details field changes
  const handlePersonalDetailChange = (field, value) => {
    setPersonalDetailsChanges(prev => ({
      ...prev,
      [field]: value
    }));
    setEditingPersonalDetails(true);
  };

  // Start editing personal details
  const startEditingPersonalDetails = () => {
    setPersonalDetailsChanges({});
    setEditingPersonalDetails(true);
  };

  // Cancel personal details editing
  const cancelPersonalDetailsChanges = () => {
    setEditingPersonalDetails(false);
    setPersonalDetailsChanges({});
  };

  // Save all personal details changes
  const savePersonalDetailsChanges = async () => {
    try {
      setSavingPersonalDetails(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Prepare update data for database (only existing fields)
      const dbUpdateData = {};
      const localStorageData = {};

      // Handle fields that exist in database
      if (personalDetailsChanges.address !== undefined) {
        dbUpdateData.address = personalDetailsChanges.address;
      }

      if (personalDetailsChanges.preferredLanguage !== undefined) {
        dbUpdateData.preferredLanguage = personalDetailsChanges.preferredLanguage;
      }

      // Handle fields that should be saved to localStorage
      if (personalDetailsChanges.dateOfBirth !== undefined) {
        localStorageData.dateOfBirth = personalDetailsChanges.dateOfBirth;
      }

      if (personalDetailsChanges.gender !== undefined) {
        localStorageData.gender = personalDetailsChanges.gender;
      }

      console.log('Database fields to update:', dbUpdateData);
      console.log('LocalStorage fields to save:', localStorageData);

      // Update database with existing fields only
      if (Object.keys(dbUpdateData).length > 0) {
        console.log('Updating database fields...');
        const response = await fetch(`http://localhost:3000/api/guest/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dbUpdateData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Database update failed:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedProfile = await response.json();
        console.log('Database update successful:', updatedProfile);

        // Update local state with database response
        setUserProfile(prev => ({ ...prev, ...updatedProfile.data }));
        // Update localStorage with database changes
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        localStorage.setItem('userProfile', JSON.stringify({ ...currentProfile, ...updatedProfile.data, ...dbUpdateData }));
      }

      // Save personal details to localStorage
      if (Object.keys(localStorageData).length > 0) {
        console.log('Saving to localStorage...');
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = { ...currentProfile, ...localStorageData };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        // Update local state
        setUserProfile(prev => ({ ...prev, ...localStorageData }));
        console.log('LocalStorage save successful');
      }

      // Reset editing state
      setEditingPersonalDetails(false);
      setPersonalDetailsChanges({});
      console.log('Save completed successfully');

    } catch (error) {
      console.error('Error updating personal details:', error);
      setError('Failed to update personal details');
    } finally {
      setSavingPersonalDetails(false);
    }
  };
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch(`http://localhost:3000/api/guest/profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const imageUrl = result.imageUrl;

          // Update local state and storage
          handleProfileUpdate('profilePicture', imageUrl);

          // Also update in database
          await updateProfileField('profilePicture', imageUrl);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setError('Failed to upload profile picture');
      }
    }
  };

  // Toggle edit mode for a field
  const toggleEdit = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save field changes
  const saveField = async (field, value) => {
    setError('');

    // Update local state immediately for better UX
    handleProfileUpdate(field, value);

    // Update in database
    const success = await updateProfileField(field, value);

    if (success) {
      toggleEdit(field);
    } else {
      // Revert local change if API update failed
      setUserProfile(prev => ({ ...prev, [field]: prev[field] }));
      setError(`Failed to update ${field}. Please try again.`);
    }
  };

  // Handle password change
  const handlePasswordChange = () => {
    setShowPasswordChange(true);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/guest/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Clear all local data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userFavorites');
          localStorage.removeItem('userBookings');

          alert('Account deleted successfully');
          navigate('/');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'Failed to delete account'}`);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account');
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fh-dashboard">
        <aside className="fh-sidebar">
          <div className="fh-brand">
            <div className="fh-logo"><span>Lodgix</span></div>
          </div>
          <div className="loading-state">Loading profile...</div>
        </aside>
        <main className="fh-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile information...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fh-dashboard">
        <aside className="fh-sidebar">
          <div className="fh-brand">
            <div className="fh-logo"><span>Lodgix</span></div>
          </div>
        </aside>
        <main className="fh-main">
          <div className="error-container">
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <button onClick={loadUserData} className="retry-btn">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fh-dashboard">
      {/* Sidebar */}
      <aside className="fh-sidebar">
        <div className="fh-brand">
          <div className="fh-logo"><span>Lodgix</span></div>
        </div>

        <nav className="fh-nav">
          <button className="nav-item" onClick={() => navigate("/dashboard")}>
            <MdOutlineDashboard className="nav-icon" />
            <span>Dashboard</span>
          </button>
          <button className="nav-item active">
            <FaUserCircle className="nav-icon" />
            <span>Profile</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/notifications")}>
            <FaBell className="nav-icon" />
            <span>Notifications</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/bookings")}>
            <MdOutlineAttachMoney className="nav-icon" />
            <span>My Bookings</span>
          </button>
        </nav>

        <div className="fh-quick-stats">
          <div className="stat">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Trips</div>
          </div>
          <div className="stat">
            <div className="stat-value">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
        </div>

        <div className="fh-legal">© {new Date().getFullYear()} Lodgix</div>
      </aside>

      {/* Main Content */}
      <main className="fh-main">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <MdPerson />
              Basic Info
            </button>
            <button
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <MdLocationOn />
              Personal Details
            </button>
            <button
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <MdPayment />
              Account Settings
            </button>
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <MdSecurity />
              Security
            </button>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="profile-section">
                <h2>Basic Information</h2>

                {/* Profile Picture */}
                <div className="profile-picture-section">
                  <div className="profile-picture-container">
                    <img
                      src={userProfile.profilePicture ? `http://localhost:3000${userProfile.profilePicture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=0071c2&color=fff&size=128`}
                      alt="Profile"
                      className="profile-picture"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=0071c2&color=fff&size=128`;
                      }}
                    />
                    <label className="picture-upload-btn">
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <div className="picture-info">
                    <h3>Profile Picture</h3>
                    <p>Upload a new profile picture. Recommended size: 400x400px</p>
                  </div>
                </div>

                {/* Basic Info Fields */}
                <div className="info-grid">
                  <div className="info-field">
                    <label>Full Name</label>
                    <div className="field-content">
                      {isEditing.name ? (
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => handleProfileUpdate('name', e.target.value)}
                          onBlur={(e) => saveField('name', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveField('name', e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span>{userProfile.name}</span>
                      )}
                      <button className="edit-btn" onClick={() => toggleEdit('name')}>
                        {isEditing.name ? <FaSave /> : <FaEdit />}
                      </button>
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Username</label>
                    <div className="field-content">
                      {isEditing.username ? (
                        <input
                          type="text"
                          value={userProfile.username}
                          onChange={(e) => handleProfileUpdate('username', e.target.value)}
                          onBlur={(e) => saveField('username', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveField('username', e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span>@{userProfile.username}</span>
                      )}
                      <button className="edit-btn" onClick={() => toggleEdit('username')}>
                        {isEditing.username ? <FaSave /> : <FaEdit />}
                      </button>
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Email Address</label>
                    <div className="field-content">
                      <span>{userProfile.email}</span>
                      <button className="edit-btn" title="Email can be changed in Account Settings">
                        <FaEdit />
                      </button>
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Phone Number</label>
                    <div className="field-content">
                      {isEditing.phone ? (
                        <input
                          type="tel"
                          value={userProfile.phone}
                          onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                          onBlur={(e) => saveField('phone', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveField('phone', e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span>{userProfile.phone}</span>
                      )}
                      <button className="edit-btn" onClick={() => toggleEdit('phone')}>
                        {isEditing.phone ? <FaSave /> : <FaEdit />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="member-info">
                  <div className="member-card">
                    <div className="member-icon">
                      <FaUserCircle />
                    </div>
                    <div className="member-details">
                      <h4>Premium Member</h4>
                      <p>Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details Tab */}
            {activeTab === 'personal' && (
              <div className="profile-section">
                <div className="personal-details-header">
                  <h2>Personal Details</h2>
                  {!editingPersonalDetails && (
                    <button className="edit-personal-btn" onClick={startEditingPersonalDetails}>
                      <FaEdit />
                      Edit Details
                    </button>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-field">
                    <label>Address</label>
                    <div className="field-content">
                      {editingPersonalDetails ? (
                        <textarea
                          value={personalDetailsChanges.address !== undefined ? personalDetailsChanges.address : userProfile.address}
                          onChange={(e) => handlePersonalDetailChange('address', e.target.value)}
                          rows={3}
                          placeholder="Enter your address"
                        />
                      ) : (
                        <span>{userProfile.address || 'Not provided'}</span>
                      )}
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Date of Birth</label>
                    <div className="field-content">
                      {editingPersonalDetails ? (
                        <input
                          type="date"
                          value={personalDetailsChanges.dateOfBirth !== undefined ? personalDetailsChanges.dateOfBirth : (userProfile.dateOfBirth || '')}
                          onChange={(e) => handlePersonalDetailChange('dateOfBirth', e.target.value)}
                        />
                      ) : (
                        <span>{userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                      )}
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Gender</label>
                    <div className="field-content">
                      {editingPersonalDetails ? (
                        <select
                          value={personalDetailsChanges.gender !== undefined ? personalDetailsChanges.gender : (userProfile.gender || '')}
                          onChange={(e) => handlePersonalDetailChange('gender', e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      ) : (
                        <span className="capitalize">{userProfile.gender || 'Not specified'}</span>
                      )}
                    </div>
                  </div>

                  <div className="info-field">
                    <label>Preferred Language</label>
                    <div className="field-content">
                      {editingPersonalDetails ? (
                        <select
                          value={personalDetailsChanges.preferredLanguage !== undefined ? personalDetailsChanges.preferredLanguage : (userProfile.preferredLanguage || 'en')}
                          onChange={(e) => handlePersonalDetailChange('preferredLanguage', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="mr">Marathi</option>
                          <option value="ta">Tamil</option>
                        </select>
                      ) : (
                        <span>{userProfile.preferredLanguage === 'en' ? 'English' :
                               userProfile.preferredLanguage === 'hi' ? 'Hindi' :
                               userProfile.preferredLanguage === 'mr' ? 'Marathi' : 'Tamil'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save/Cancel buttons for personal details */}
                {editingPersonalDetails && (
                  <div className="personal-details-actions">
                    <button className="cancel-btn" onClick={cancelPersonalDetailsChanges}>
                      <FaTimes />
                      Cancel
                    </button>
                    <button className="save-changes-btn" onClick={savePersonalDetailsChanges} disabled={savingPersonalDetails}>
                      {savingPersonalDetails ? (
                        <>
                          <div className="loading-spinner small"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="profile-section">
                <h2>Account Settings</h2>

                <div className="settings-grid">
                  {showEmailChange ? (
                    <div className="setting-card">
                      <EmailChange
                        currentEmail={userProfile.email}
                        onEmailUpdate={handleEmailUpdate}
                        onCancel={() => setShowEmailChange(false)}
                      />
                    </div>
                  ) : showPasswordChange ? (
                    <div className="setting-card">
                      <PasswordChange
                        onPasswordUpdate={handlePasswordUpdate}
                        onCancel={() => setShowPasswordChange(false)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="setting-card">
                        <div className="setting-icon">
                          <MdEmail />
                        </div>
                        <div className="setting-content">
                          <h3>Change Email Address</h3>
                          <p>Current: {userProfile.email}</p>
                          <p>Update your email address for account notifications</p>
                          <button className="setting-btn" onClick={() => setShowEmailChange(true)}>Update Email</button>
                        </div>
                      </div>

                      <div className="setting-card">
                        <div className="setting-icon">
                          <MdPhone />
                        </div>
                        <div className="setting-content">
                          <h3>Phone Number</h3>
                          <p>Current: {userProfile.phone || 'Not set'}</p>
                          <p>Phone number updates are not available at this time</p>
                          <button className="setting-btn" disabled>Update Phone</button>
                        </div>
                      </div>

                      <div className="setting-card">
                        <div className="setting-icon">
                          <FaLock />
                        </div>
                        <div className="setting-content">
                          <h3>Change Password</h3>
                          <p>Update your password to keep your account secure</p>
                          <button className="setting-btn" onClick={handlePasswordChange}>Change Password</button>
                        </div>
                      </div>

                      <div className="setting-card">
                        <div className="setting-icon">
                          <FaBell />
                        </div>
                        <div className="setting-content">
                          <h3>Notification Preferences</h3>
                          <p>Manage how you receive booking updates and promotions</p>
                          <button className="setting-btn">Manage Notifications</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Booking History Preview - Only show when not in email or password change mode */}
                {!showEmailChange && !showPasswordChange && (
                  <div className="booking-history-preview">
                    <h3>Recent Booking Activity</h3>
                    {recentBookings.length > 0 ? (
                      <div className="recent-bookings">
                        {recentBookings.map((booking, index) => (
                          <div key={booking.receiptId || index} className="recent-booking-item">
                            <div className="booking-info">
                              <h4>{booking.hotelName}</h4>
                              <p>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                              <span className={`status ${booking.status}`}>{booking.status}</span>
                            </div>
                            <div className="booking-amount">₹{booking.totalAmount?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-bookings">No recent bookings</p>
                    )}
                    <button className="view-all-btn" onClick={() => navigate('/bookings')}>
                      View All Bookings
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <h2>Security & Privacy</h2>

                <div className="security-grid">
                  <div className="security-card">
                    <div className="security-icon">
                      <MdSecurity />
                    </div>
                    <div className="security-content">
                      <h3>Last Login</h3>
                      <p>{new Date(userProfile.lastLogin).toLocaleString()}</p>
                      <small>From {userProfile.lastLoginLocation}</small>
                    </div>
                  </div>

                  <div className="security-card">
                    <div className="security-icon">
                      <FaLock />
                    </div>
                    <div className="security-content">
                      <h3>Account Security</h3>
                      <p>Your account is protected with industry-standard encryption</p>
                      <div className="security-status">
                        <span className="status-indicator good"></span>
                        <span>Secure</span>
                      </div>
                    </div>
                  </div>

                  <div className="security-card">
                    <div className="security-icon">
                      <MdPerson />
                    </div>
                    <div className="security-content">
                      <h3>Active Sessions</h3>
                      <p>1 active session</p>
                      <button className="setting-btn small">View Sessions</button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p className="danger-warning">
                    These actions are permanent and cannot be undone. Please be careful.
                  </p>

                  <div className="danger-actions">
                    <button className="danger-btn logout" onClick={() => {
                      // Clear all authentication data from localStorage
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      localStorage.removeItem('userEmail');
                      localStorage.removeItem('userFavorites');
                      localStorage.removeItem('userBookings');
                      localStorage.removeItem('redirectAfterLogin');
                      localStorage.removeItem('userProfile');
                      localStorage.removeItem('lodgixBookings');

                      // Redirect to login page
                      navigate('/');
                    }}>
                      <MdOutlineLogout />
                      Logout
                    </button>
                    <button className="danger-btn deactivate" onClick={() => alert('Account deactivation feature coming soon!')}>
                      <FaBan />
                      Deactivate Account
                    </button>
                    <button className="danger-btn delete" onClick={handleDeleteAccount}>
                      <FaTrash />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
