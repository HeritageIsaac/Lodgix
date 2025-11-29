import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaHotel, FaCalendarAlt, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1>Admin Dashboard</h1>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin/dashboard" className="nav-link">
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="nav-link">
                <FaUsers className="nav-icon" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/hotels" className="nav-link">
                <FaHotel className="nav-icon" />
                <span>Hotels</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/bookings" className="nav-link">
                <FaCalendarAlt className="nav-icon" />
                <span>Bookings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-content ${!isSidebarOpen ? 'full-width' : ''}`}>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
