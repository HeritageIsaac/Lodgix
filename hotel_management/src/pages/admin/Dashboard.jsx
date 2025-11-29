import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';
import './AdminDashboard.css';

// Icons (you can replace with your preferred icon library)
import { FaHotel, FaUsers, FaBed, FaMoneyBillWave, FaChartLine, FaSignOutAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // If unauthorized, redirect to login
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setStats({
            totalHotels: data.data.totalHotels || 0,
            totalBookings: data.data.totalBookings || 0,
            totalRevenue: data.data.totalRevenue || 0,
            totalUsers: data.data.totalUsers || 0
          });
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Failed to load dashboard data. Please try again later.');
        toast.error(error.message || 'Failed to load dashboard data', {
          position: 'top-right',
          autoClose: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Set up polling to refresh stats every 5 minutes
    const intervalId = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);
  
  // Function to send notification to users
  const sendNotification = async (userId, message) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message,
          type: 'admin_notification'
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send notification');
      }

      // Show success toast
      toast.success('Notification sent successfully!', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(`Failed to send notification: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="logo">
          <h2>LODGIX Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine className="nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            <FaHotel className="nav-icon" />
            <span>Hotels</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaBed className="nav-icon" />
            <span>Bookings</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="nav-icon" />
            <span>Users</span>
          </button>
          
          <button 
            className="nav-item logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-profile">
            <span>Admin User</span>
            <div className="profile-avatar">
              {localStorage.getItem('adminName')?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon hotels">
                    <FaHotel />
                  </div>
                  <div className="stat-info">
                    <h3>Total Hotels</h3>
                    <p>{stats.totalHotels}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon bookings">
                    <FaBed />
                  </div>
                  <div className="stat-info">
                    <h3>Total Bookings</h3>
                    <p>{stats.totalBookings}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon revenue">
                    <FaMoneyBillWave />
                  </div>
                  <div className="stat-info">
                    <h3>Total Revenue</h3>
                    <p>{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon users">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Add more dashboard widgets here */}
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  <p>No recent activity</p>
                  {/* Map through recent activities here */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="hotels-management">
              <div className="section-header">
                <h2>Hotels Management</h2>
                <button className="btn-primary">Add New Hotel</button>
              </div>
              <div className="hotels-list">
                <p>Hotels list will appear here</p>
                {/* Hotels table will go here */}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-management">
              <h2>Bookings Management</h2>
              <p>Bookings list will appear here</p>
              {/* Bookings table will go here */}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <h2>Users Management</h2>
              <p>Users list will appear here</p>
              {/* Users table will go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
