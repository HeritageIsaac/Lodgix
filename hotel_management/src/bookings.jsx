import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaEye, FaSearch, FaFilter, FaCalendarAlt, FaBell } from 'react-icons/fa';
import {
  MdOutlineDashboard,
  MdOutlineHotel,
  MdOutlineAttachMoney,
  MdOutlineReceipt,
  MdFilterList
} from 'react-icons/md';
import './bookings.css';

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load bookings from localStorage on component mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('lodgixBookings');
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      setBookings(parsedBookings);
      setFilteredBookings(parsedBookings);
    }
  }, []);

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.receiptId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(booking =>
        booking.checkIn?.includes(dateFilter) || booking.checkOut?.includes(dateFilter)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'confirmed': { class: 'status-confirmed', text: 'Confirmed' },
      'completed': { class: 'status-completed', text: 'Completed' },
      'cancelled': { class: 'status-cancelled', text: 'Cancelled' },
      'pending': { class: 'status-pending', text: 'Pending' }
    };
    const config = statusConfig[status] || { class: 'status-pending', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const viewReceipt = (booking) => {
    setSelectedBooking(booking);
    setShowReceiptModal(true);
  };

  const downloadReceipt = (booking) => {
    // Create receipt content
    const receiptContent = `
BOOKING RECEIPT
================

Receipt ID: ${booking.receiptId}
Booking Date: ${formatDate(booking.bookingDate)}
Status: ${booking.status}

GUEST INFORMATION
-----------------
Name: ${booking.guestName}
Phone: ${booking.phone}
Email: ${booking.email}

HOTEL DETAILS
-------------
Hotel: ${booking.hotelName}
Check-in: ${formatDate(booking.checkIn)}
Check-out: ${formatDate(booking.checkOut)}
Nights: ${booking.nights}

ROOM DETAILS
------------
${booking.selectedRooms?.map(room =>
  `${room.name}: ${room.quantity} × ₹${room.price.toLocaleString()} = ₹${(room.price * room.quantity * booking.nights).toLocaleString()}`
).join('\n')}

PAYMENT INFORMATION
------------------
Payment Method: ${booking.paymentMethod}
Total Amount: ₹${booking.totalAmount?.toLocaleString()}

Thank you for choosing Lodgix!
    `.trim();

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking.receiptId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <div className="bookings-container">
      {/* Sidebar */}
      <aside className="bookings-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><span>Lodgix</span></div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <MdOutlineDashboard className="nav-icon" />
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/profile")}>
            <MdOutlineHotel className="nav-icon" />
            <span>Profile</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/notifications")}>
            <FaBell className="nav-icon" />
            <span>Notifications</span>
          </button>
          <button className="nav-item active">
            <MdOutlineAttachMoney className="nav-icon" />
            <span>Bookings</span>
          </button>
        </nav>

        <div className="sidebar-stats">
          <div className="stat">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>

        <div className="sidebar-legal">© {new Date().getFullYear()} Lodgix</div>
      </aside>

      {/* Main Content */}
      <main className="bookings-main">
        <div className="bookings-header">
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft />
            Back to Dashboard
          </Link>
          <h1 className="page-title">Booking Management</h1>
        </div>

        {/* Filters and Search */}
        <div className="bookings-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by guest name, hotel, or receipt ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-filter"
            />

            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bookings-table-container">
          {filteredBookings.length > 0 ? (
            <div className="bookings-table">
              <div className="table-header">
                <div>Receipt ID</div>
                <div>Guest</div>
                <div>Hotel</div>
                <div>Check-in</div>
                <div>Check-out</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {filteredBookings.map((booking) => (
                <div key={booking.receiptId} className="table-row">
                  <div className="receipt-id">
                    <MdOutlineReceipt />
                    {booking.receiptId}
                  </div>
                  <div className="guest-info">
                    <div className="guest-avatar">
                      {booking.guestName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="guest-name">{booking.guestName}</div>
                      <div className="guest-email">{booking.email}</div>
                    </div>
                  </div>
                  <div className="hotel-name">{booking.hotelName}</div>
                  <div>{formatDate(booking.checkIn)}</div>
                  <div>{formatDate(booking.checkOut)}</div>
                  <div className="amount">₹{booking.totalAmount?.toLocaleString()}</div>
                  <div>{getStatusBadge(booking.status)}</div>
                  <div className="actions">
                    <button
                      onClick={() => viewReceipt(booking)}
                      className="action-btn view-btn"
                      title="View Receipt"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="action-btn download-btn"
                      title="Download Receipt"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-bookings">
              <MdOutlineReceipt size={48} />
              <h3>No bookings found</h3>
              <p>
                {bookings.length === 0
                  ? "You haven't made any bookings yet."
                  : "No bookings match your current filters."}
              </p>
              {bookings.length > 0 && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Booking Receipt</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowReceiptModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="receipt-preview">
                  <div className="receipt-header">
                    <h3>Lodgix Booking Receipt</h3>
                    <div className="receipt-id-display">
                      <strong>Receipt ID:</strong> {selectedBooking.receiptId}
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h4>Guest Information</h4>
                    <div className="receipt-row">
                      <span className="label">Name:</span>
                      <span className="value">{selectedBooking.guestName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedBooking.phone}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Email:</span>
                      <span className="value">{selectedBooking.email}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h4>Booking Details</h4>
                    <div className="receipt-row">
                      <span className="label">Hotel:</span>
                      <span className="value">{selectedBooking.hotelName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Check-in:</span>
                      <span className="value">{formatDate(selectedBooking.checkIn)}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Check-out:</span>
                      <span className="value">{formatDate(selectedBooking.checkOut)}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Nights:</span>
                      <span className="value">{selectedBooking.nights}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h4>Room Details</h4>
                    {selectedBooking.selectedRooms?.map((room, index) => (
                      <div key={index} className="receipt-row">
                        <span className="label">{room.name}:</span>
                        <span className="value">
                          {room.quantity} × ₹{room.price.toLocaleString()} = ₹{(room.price * room.quantity * selectedBooking.nights).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="receipt-section">
                    <h4>Payment Information</h4>
                    <div className="receipt-row">
                      <span className="label">Payment Method:</span>
                      <span className="value">{selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="receipt-total">
                      <span className="label">Total Amount:</span>
                      <span className="value">₹{selectedBooking.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => downloadReceipt(selectedBooking)}
                  className="download-btn-modal"
                >
                  <FaDownload /> Download Receipt
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="close-btn-modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Bookings;