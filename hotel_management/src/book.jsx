import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { hotels } from './dummyData';
import { FaArrowLeft, FaUserCircle, FaBed, FaBell } from 'react-icons/fa';
import {
  MdPerson,
  MdCalendarToday,
  MdLocationOn,
  MdStar,
  MdOutlineDashboard,
  MdOutlineHotel,
  MdOutlineAttachMoney
} from 'react-icons/md';
import "./book.css";

function Book() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const hotel = location.state?.hotel || hotels.find(h => h.id === parseInt(id));

  // Debug logging
  console.log('Book component loaded');
  console.log('URL ID:', id);
  console.log('Location state:', location.state);
  console.log('Hotels data length:', hotels.length);
  console.log('Available hotel IDs:', hotels.map(h => h.id));
  console.log('Found hotel:', hotel);

  if (!hotel) {
    console.log('Hotel not found, available hotels:', hotels.map(h => ({ id: h.id, name: h.name })));
    return (
      <div className="dashboard-container">
        <main className="main-content">
          <h1 className="hotel-title">Hotel Not Found</h1>
          <p>The hotel you are looking for does not exist.</p>
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft />
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // If hotel exists but no roomTypes, show error
  if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
    console.log('Hotel found but no room types:', hotel);
    return (
      <div className="dashboard-container">
        <main className="main-content">
          <h1 className="hotel-title">Booking Unavailable</h1>
          <p>This hotel doesn't have room types configured yet.</p>
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft />
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // Enhanced state for form with validation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
    selectedRooms: [], // Array of {roomTypeId, quantity}
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [bookingStep, setBookingStep] = useState('details'); // details, payment, confirmed
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptError, setReceiptError] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = () => {
      let storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

      if (!storedEmail) {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            storedEmail = profile.email;
          } catch (e) {
            console.log('Error parsing user profile:', e);
          }
        }
      }

      if (storedEmail && storedEmail.trim()) {
        setUserEmail(storedEmail.trim());
        setFormData(prev => ({ ...prev, email: storedEmail.trim() }));
      }
    };

    // Load favorites and bookings from localStorage
    const loadUserData = () => {
      const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      setFavorites(savedFavorites);
      setBookings(savedBookings);
    };

    getUserEmail();
    loadUserData();
  }, []);

  // Helpers for testing
  const setTestEmail = (email) => {
    localStorage.setItem('userEmail', email);
    setUserEmail(email);
    setFormData(prev => ({ ...prev, email: email }));
  };

  const debugStorage = () => {
    console.log('localStorage userEmail:', localStorage.getItem('userEmail'));
    console.log('sessionStorage userEmail:', sessionStorage.getItem('userEmail'));
    console.log('localStorage userProfile:', localStorage.getItem('userProfile'));
  };

  const validateForm = () => {
    const errors = {};
    console.log('🔍 Validating form...');
    console.log('📋 Current form data:', formData);

    // Basic validation - only check for absolutely required fields
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.checkIn) {
      errors.checkIn = "Check-in date is required";
    }
    if (!formData.checkOut) errors.checkOut = "Check-out date is required";

    const totalRooms = getTotalRoomsCount();
    console.log('🏨 Total rooms selected:', totalRooms);
    if (totalRooms === 0) errors.selectedRooms = "Please select at least one room type";

    console.log('❌ Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoomSelection = (roomTypeId, quantity) => {
    console.log('🔄 Room selection triggered:', { roomTypeId, quantity, currentSelectedRooms: formData.selectedRooms });

    setFormData(prev => {
      const existingRoomIndex = prev.selectedRooms.findIndex(room => room.roomTypeId === roomTypeId);

      let newSelectedRooms;
      if (quantity === 0) {
        // Remove room type if quantity is 0
        newSelectedRooms = prev.selectedRooms.filter(room => room.roomTypeId !== roomTypeId);
        console.log('➖ Removed room type:', roomTypeId);
      } else if (existingRoomIndex >= 0) {
        // Update existing room type quantity
        const updatedRooms = [...prev.selectedRooms];
        updatedRooms[existingRoomIndex] = { roomTypeId, quantity };
        newSelectedRooms = updatedRooms;
        console.log('🔄 Updated room quantity:', { roomTypeId, quantity });
      } else {
        // Add new room type
        newSelectedRooms = [...prev.selectedRooms, { roomTypeId, quantity }];
        console.log('➕ Added new room type:', { roomTypeId, quantity });
      }

      console.log('📋 New selected rooms:', newSelectedRooms);

      return {
        ...prev,
        selectedRooms: newSelectedRooms
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptError('');
    } else {
      setReceiptFile(null);
    }
  };

  const handleFinalizeBooking = async () => {
    if (paymentMethod === 'bank' && !receiptFile) {
      setReceiptError('Please upload a payment receipt to continue.');
      return;
    }

    setIsSubmitting(true);
    // Generate unique receipt ID
    const generatedReceiptId = `HTL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setReceiptId(generatedReceiptId);

    try {
      // Get logged-in user info
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      // Get guest_id from localStorage or decode from token
      let guestId = localStorage.getItem('guestId');
      
      if (!guestId && token) {
        // Try to decode guest_id from token (basic JWT decode)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          guestId = payload.id || payload.guest_id;
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }

      // Create booking object for storage
      const bookingData = {
        receiptId: generatedReceiptId,
        guestName: formData.name,
        email: formData.email,
        phone: formData.phone,
        hotelName: hotel.name,
        hotelId: hotel.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: nights,
        selectedRooms: formData.selectedRooms.map(selectedRoom => {
          const roomType = hotel.roomTypes.find(room => room.id === selectedRoom.roomTypeId);
          return {
            id: selectedRoom.roomTypeId,
            name: roomType?.name || 'Unknown Room',
            quantity: selectedRoom.quantity,
            price: roomType?.price || 0
          };
        }),
        paymentMethod: paymentMethod,
        totalAmount: total,
        status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
        bookingDate: new Date().toISOString().split('T')[0],
        specialRequests: formData.specialRequests
      };

      // Send booking to backend API to trigger notification
      if (guestId) {
        try {
          const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              guest_id: parseInt(guestId),
              room_id: formData.selectedRooms[0]?.roomTypeId || 1, // Use first room or default
              check_in_date: formData.checkIn,
              check_out_date: formData.checkOut,
              total_amount: total,
              status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
              payment_status: paymentMethod === 'cash' ? 'paid' : 'pending',
              hotel_name: hotel.name // This triggers the notification
            })
          });

          const result = await response.json();
          console.log('✅ Booking created in backend:', result);
          
          if (result.status === 'success') {
            console.log('🔔 Notification should be created for guest', guestId);
          }
        } catch (apiError) {
          console.error('⚠️ Error creating booking in backend:', apiError);
          // Continue with localStorage save even if API fails
        }
      } else {
        console.warn('⚠️ No guest_id found, notification not created');
      }

      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('lodgixBookings') || '[]');
      const updatedBookings = [...existingBookings, bookingData];
      localStorage.setItem('lodgixBookings', JSON.stringify(updatedBookings));

      console.log("Final booking details:", { ...formData, paymentMethod, receipt: receiptFile?.name, receiptId: generatedReceiptId });
      setIsSubmitting(false);
      setBookingStep('confirmed');
    } catch (error) {
      console.error('Error finalizing booking:', error);
      alert('There was an error completing your booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('🏨 Total rooms count:', getTotalRoomsCount());

    if (!validateForm()) {
      console.log('❌ Validation failed:', formErrors);
      alert('Please fix the errors above before proceeding to payment.');
      return;
    }

    console.log('✅ Validation passed, proceeding to payment...');
    setIsSubmitting(true);

    // Show success message
    alert('Form validated successfully! Proceeding to payment...');

    // Move to payment step after a brief delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setBookingStep('payment');
  };

  // Calculate booking details
  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOutDate - checkInDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();

    let subtotal = 0;
    formData.selectedRooms.forEach(selectedRoom => {
      const roomType = hotel.roomTypes.find(room => room.id === selectedRoom.roomTypeId);
      if (roomType) {
        subtotal += roomType.price * nights * selectedRoom.quantity;
      }
    });

    const fees = 500; // Service fees only
    return subtotal + fees;
  };

  // Calculate total rooms count for validation and display
  const getTotalRoomsCount = () => {
    return formData.selectedRooms.reduce((total, room) => total + room.quantity, 0);
  };

  const nights = calculateNights();
  const total = calculateTotal();

  if (!hotel) {
    return (
      <div className="dashboard-container">
        <main className="main-content">
          <h1 className="hotel-title">Hotel Not Found</h1>
          <p>The hotel you are looking for does not exist.</p>
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft />
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="fh-sidebar">
        <div className="fh-brand">
          <div className="fh-logo"><span>Lodgix</span></div>
        </div>

        <nav className="fh-nav">
          <button className="nav-item" onClick={() => window.history.back()}>
            <MdOutlineDashboard className="nav-icon" />
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/profile")}>
            <FaUserCircle className="nav-icon" />
            <span>Profile</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/notifications")}>
            <FaBell className="nav-icon" />
            <span>Notifications</span>
          </button>
          <button className="nav-item active">
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

      {/* Main content */}
      <main className="main-content">
        <Link to={`/hotel/${hotel.id}`} className="back-link">
          <FaArrowLeft />
          Back to Hotel Details
        </Link>

        <h1 className="hotel-title">Complete Your Booking</h1>

        {/* Progress Indicator */}
        <div className="booking-progress">
          <div className={`progress-step ${bookingStep === 'details' ? 'active' : bookingStep === 'payment' || bookingStep === 'confirmed' ? 'completed' : ''}`}>
            <MdPerson />
            <span>Guest Details</span>
          </div>
          <div className="progress-divider"></div>
          <div className={`progress-step ${bookingStep === 'payment' ? 'active' : bookingStep === 'confirmed' ? 'completed' : ''}`}>
            <MdOutlineAttachMoney />
            <span>Payment</span>
          </div>
          <div className="progress-divider"></div>
          <div className={`progress-step ${bookingStep === 'confirmed' ? 'active completed' : ''}`}>
            <MdOutlineDashboard />
            <span>Confirmation</span>
          </div>
        </div>

        <div className="booking-layout">
          {/* Left Column: Form */}
          <div className="booking-form-container">
            {bookingStep === 'details' && (
              <form className="booking-form-full" onSubmit={handleSubmit}>
                <h3><MdPerson /> Guest Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={formErrors.name ? 'error' : ''} />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={formErrors.email ? 'error' : ''} readOnly={!!userEmail} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+</span>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="91 XXXXX XXXXX" className={formErrors.phone ? 'error' : ''} />
                    </div>
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="guests">Number of Rooms *</label>
                    <select id="guests" name="guests" value={formData.guests} onChange={handleChange} className={formErrors.guests ? 'error' : ''}>
                      <option value={1}>1 Room</option>
                      <option value={2}>2 Rooms</option>
                      <option value={3}>3 Rooms</option>
                      <option value={4}>4+ Rooms</option>
                    </select>
                  </div>
                </div>
                <h3 style={{ marginTop: '20px' }}><MdOutlineHotel /> Room Selection</h3>
                <div className="room-selection">
                  <p className="room-selection-info">Select the room types and quantities you need for your stay.</p>
                  {hotel.roomTypes.map(roomType => {
                    const selectedRoom = formData.selectedRooms.find(room => room.roomTypeId === roomType.id);
                    const quantity = selectedRoom ? selectedRoom.quantity : 0;

                    return (
                      <div key={roomType.id} className="room-type-card">
                        <div className="room-type-info">
                          <h4>{roomType.name}</h4>
                          <p className="room-description">{roomType.description}</p>
                          <p className="room-price">₹{roomType.price.toLocaleString()} per night</p>
                        </div>
                        <div className="room-quantity-selector">
                          <label>Quantity:</label>
                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() => handleRoomSelection(roomType.id, Math.max(0, quantity - 1))}
                              className="quantity-btn"
                            >
                              -
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleRoomSelection(roomType.id, quantity + 1)}
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {formErrors.selectedRooms && <span className="error-message">{formErrors.selectedRooms}</span>}
                </div>
                <h3 style={{ marginTop: '20px' }}><MdCalendarToday /> Stay Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="checkIn">Check-in Date *</label>
                    <input type="date" id="checkIn" name="checkIn" value={formData.checkIn} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className={formErrors.checkIn ? 'error' : ''} />
                    {formErrors.checkIn && <span className="error-message">{formErrors.checkIn}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkOut">Check-out Date *</label>
                    <input type="date" id="checkOut" name="checkOut" value={formData.checkOut} onChange={handleChange} min={formData.checkIn || new Date().toISOString().split('T')[0]} className={formErrors.checkOut ? 'error' : ''} />
                    {formErrors.checkOut && <span className="error-message">{formErrors.checkOut}</span>}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="specialRequests">Special Requests (Optional)</label>
                  <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleChange} placeholder="Any special requests or requirements..." rows={3} />
                </div>
                <button type="submit" className="book-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            )}

            {bookingStep === 'payment' && (
              <div className="booking-form-full">
                <h3>Select Payment Method</h3>
                <div className="payment-methods">
                  <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => { setPaymentMethod('card'); setReceiptError(''); }} />
                    Credit/Debit Card
                  </label>
                  <label className={`payment-method ${paymentMethod === 'bank' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => { setPaymentMethod('bank'); setReceiptError(''); }} />
                    Bank Transfer
                  </label>
                  <label className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => { setPaymentMethod('cash'); setReceiptError(''); }} />
                    Cash on Arrival
                  </label>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="payment-info">
                    <p>You will pay the total amount upon arrival at the hotel reception.</p>
                    <div className="amount-display">
                      <h4>Amount to Pay: ₹{total.toLocaleString()}</h4>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="payment-info">
                    <p>Please transfer the total amount to the following bank account:</p>
                    <div className="amount-display">
                      <h4>Amount to Pay: ₹{total.toLocaleString()}</h4>
                    </div>
                    <div className="bank-details">
                      <p><strong>Account Name:</strong> Lodgix Inc.</p>
                      <p><strong>Account Number:</strong> 7042750829</p>
                      <p><strong>Bank:</strong> Palmapy Bank</p>
                    </div>
                    <p>After payment, please upload the receipt below.</p>
                    <div className="form-group">
                      <label htmlFor="receipt">Upload Payment Receipt *</label>
                      <input type="file" id="receipt" name="receipt" onChange={handleFileChange} accept="image/*,.pdf" className={receiptError ? 'error' : ''} />
                      {receiptError && <span className="error-message">{receiptError}</span>}
                    </div>
                  </div>
                )}

                <button onClick={handleFinalizeBooking} className="book-btn" disabled={isSubmitting || paymentMethod === 'card'}>
                  {isSubmitting ? 'Finalizing...' : 'Complete Booking'}
                </button>
              </div>
            )}
            {bookingStep === 'confirmed' && (
              <div className="booking-receipt">
                <div className="receipt-header">
                  <h2>Booking Receipt</h2>
                  <div className="receipt-id">
                    <strong>Receipt ID:</strong> {receiptId}
                  </div>
                </div>

                <div className="receipt-body">
                  <div className="receipt-section">
                    <h3>Guest Information</h3>
                    <div className="receipt-row">
                      <span className="label">Name:</span>
                      <span className="value">{formData.name}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Phone:</span>
                      <span className="value">{formData.phone}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="label">Email:</span>
                      <span className="value">{formData.email}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h3>Room Details</h3>
                    {formData.selectedRooms.map(selectedRoom => {
                      const roomType = hotel.roomTypes.find(room => room.id === selectedRoom.roomTypeId);
                      if (!roomType) return null;

                      return (
                        <div key={selectedRoom.roomTypeId} className="receipt-row">
                          <span className="label">{roomType.name}:</span>
                          <span className="value">{selectedRoom.quantity} × ₹{roomType.price.toLocaleString()} = ₹{(roomType.price * selectedRoom.quantity * nights).toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <div className="receipt-row">
                      <span className="label">Nights:</span>
                      <span className="value">{nights}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h3>Payment Information</h3>
                    <div className="receipt-row">
                      <span className="label">Payment Method:</span>
                      <span className="value">{paymentMethod}</span>
                    </div>
                  </div>

                  <div className="receipt-section">
                    <h3>Charges</h3>
                    {formData.selectedRooms.map(selectedRoom => {
                      const roomType = hotel.roomTypes.find(room => room.id === selectedRoom.roomTypeId);
                      if (!roomType) return null;

                      return (
                        <div key={selectedRoom.roomTypeId} className="receipt-row">
                          <span className="label">{roomType.name} ({selectedRoom.quantity} × {nights} nights × ₹{roomType.price.toLocaleString()}):</span>
                          <span className="value">₹{(roomType.price * selectedRoom.quantity * nights).toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <div className="receipt-row">
                      <span className="label">Service Fee:</span>
                      <span className="value">₹500</span>
                    </div>
                    <div className="receipt-total">
                      <span className="label">Total Amount:</span>
                      <span className="value">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="receipt-footer">
                  <p>Thank you for booking with Lodgix!</p>
                  <p>For any inquiries, please contact us at support@lodgix.com</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div className="booking-summary-container">
            <div className="booking-card-full">
              <div className="booking-image">
                <img src={hotel.image} alt={hotel.name} />
              </div>
              <div className="booking-info">
                <h2>{hotel.name}</h2>
                <p><MdLocationOn /> {hotel.address}</p>
                <p><MdStar style={{ color: '#f59e0b' }} /> {hotel.rating} ({hotel.reviews} reviews)</p>
              </div>
            </div>

            <div className="booking-summary-bottom">
              <div className="summary-header"><h4>Booking Summary</h4></div>
              {nights > 0 ? (
                <>
                  {formData.selectedRooms.map(selectedRoom => {
                    const roomType = hotel.roomTypes.find(room => room.id === selectedRoom.roomTypeId);
                    if (!roomType) return null;

                    return (
                      <div key={selectedRoom.roomTypeId} className="summary-row">
                        <span>{roomType.name} ({selectedRoom.quantity})</span>
                        <span>₹{(roomType.price * selectedRoom.quantity * nights).toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="summary-row"><span>Nights</span> <span>{nights}</span></div>
                  <div className="summary-row"><span>Service Fee</span> <span>₹500</span></div>
                  <div className="summary-total"><span>Total Amount</span> <span>₹{total.toLocaleString()}</span></div>
                </>
              ) : (
                <p className="summary-placeholder">Select dates to see price</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Book;
