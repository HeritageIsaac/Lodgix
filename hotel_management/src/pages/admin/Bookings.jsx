import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaUser, FaHotel, FaDollarSign, FaCheckCircle, FaTimesCircle, FaClock, FaPrint, FaEnvelope } from 'react-icons/fa';
import './AdminLayout.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const bookingsPerPage = 10;

  // Mock data - replace with API call
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Replace with actual API call
        const mockBookings = Array(25).fill().map((_, i) => {
          const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
          const status = statuses[i % statuses.length];
          const checkIn = new Date();
          checkIn.setDate(checkIn.getDate() + i);
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);
          
          return {
            id: `BK${(i + 1000).toString().padStart(4, '0')}`,
            guestName: `Guest ${i + 1}`,
            guestEmail: `guest${i + 1}@example.com`,
            hotelName: `Luxury Hotel ${(i % 5) + 1}`,
            roomType: ['Deluxe', 'Suite', 'Standard', 'Executive'][i % 4],
            checkIn: checkIn.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0],
            guests: 1 + (i % 4),
            totalAmount: 150 + (i * 15.5),
            status: status,
            bookingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentStatus: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'refunded'
          };
        });
        
        setBookings(mockBookings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on search term and selected filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'all' || 
      booking.status === selectedFilter ||
      (selectedFilter === 'upcoming' && new Date(booking.checkIn) > new Date()) ||
      (selectedFilter === 'current' && 
       new Date(booking.checkIn) <= new Date() && 
       new Date(booking.checkOut) >= new Date());
    
    return matchesSearch && matchesFilter;
  });

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const updateBookingStatus = (bookingId, newStatus) => {
    // Replace with actual API call
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge success"><FaCheckCircle /> Confirmed</span>;
      case 'pending':
        return <span className="status-badge warning"><FaClock /> Pending</span>;
      case 'cancelled':
        return <span className="status-badge danger"><FaTimesCircle /> Cancelled</span>;
      case 'completed':
        return <span className="status-badge info"><FaCheckCircle /> Completed</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge success">Paid</span>;
      case 'pending':
        return <span className="badge warning">Pending</span>;
      case 'refunded':
        return <span className="badge info">Refunded</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Booking Management</h1>
        <div className="header-actions">
          <button className="btn btn-secondary mr-2">
            <FaPrint className="mr-2" /> Print Report
          </button>
          <button className="btn btn-primary">
            <FaPlus className="mr-2" /> New Booking
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Bookings
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'current' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('current')}
          >
            Current Stays
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('pending')}
          >
            Pending
          </button>
        </div>

        <div className="filter-options">
          <div className="form-group">
            <label>Check-in Date:</label>
            <div className="date-input">
              <FaCalendarAlt className="date-icon" />
              <input type="date" className="form-control" />
            </div>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select className="form-control">
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p>{bookings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon confirmed">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>Confirmed</h3>
            <p>{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaDollarSign />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Hotel</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <div className="guest-info">
                      <div className="guest-avatar">
                        {booking.guestName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="guest-name">{booking.guestName}</div>
                        <div className="guest-email">{booking.guestEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="hotel-info">
                      <div className="hotel-name">{booking.hotelName}</div>
                      <div className="room-type">{booking.roomType} Room</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <div className="date">{new Date(booking.checkIn).toLocaleDateString()}</div>
                      <div className="time">14:00</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <div className="date">{new Date(booking.checkOut).toLocaleDateString()}</div>
                      <div className="time">12:00</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount">
                      ${booking.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>{getPaymentStatusBadge(booking.paymentStatus)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Details">
                        <FaUser />
                      </button>
                      <button className="btn-icon" title="Send Email">
                        <FaEnvelope />
                      </button>
                      {booking.status === 'pending' && (
                        <button 
                          className="btn-icon success"
                          title="Confirm Booking"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button 
                          className="btn-icon danger"
                          title="Cancel Booking"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <FaTimesCircle />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No bookings found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
            className="pagination-arrow"
          >
            &laquo; Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
