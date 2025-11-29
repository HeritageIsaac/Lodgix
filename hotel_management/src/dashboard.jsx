import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, FaBell, FaUserCircle, FaSearch, FaBed, FaCalendarAlt, FaUserFriends, FaFilter, FaCheck, FaTh, FaList } from 'react-icons/fa';
import { MdOutlineDashboard, MdOutlineHotel, MdOutlineAttachMoney, MdOutlineLogout, MdOutlineVilla, MdApartment } from "react-icons/md";
import { BiHotel } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import './dashboard.css';
import { useNavigate } from "react-router-dom";
import { hotels as initialHotels } from './dummyData';


function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersCount, setFiltersCount] = useState(0);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();



  const hotelTypes = [
    { id: 'all', name: 'All', icon: <MdOutlineHotel className="type-icon" /> },
    { id: 'hotel', name: 'Hotels', icon: <BiHotel className="type-icon" /> },
    { id: 'resort', name: 'Resorts', icon: <MdOutlineVilla className="type-icon" /> },
    { id: 'apartment', name: 'Apartments', icon: <MdApartment className="type-icon" /> },
  ];

  const amenities = [
    'Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Airport Shuttle'
  ];

  const sortOptions = [
    { id: 'recommended', name: 'Recommended' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Top Rated' },
  ];



  const [hotels, setHotels] = useState(initialHotels);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    setFavorites(savedFavorites);

    // Load bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('lodgixBookings') || '[]');
    setBookings(savedBookings);
  }, []);

  useEffect(() => {
    let count = 0;

    // Count price filter (if not default range)
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      count++;
    }

    // Count type filter
    if (selectedType !== "all") {
      count++;
    }

    // Count amenities
    if (selectedAmenities.length > 0) {
      count += selectedAmenities.length;
    }

    setFiltersCount(count);
  }, [priceRange, selectedType, selectedAmenities]);


  const toggleFavorite = (id) => {
    const updatedFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];

    setFavorites(updatedFavorites);
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));

    // Update hotel favorite status
    setHotels(hotels.map(h =>
      h.id === id ? { ...h, favorite: !h.favorite } : h
    ));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };


  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };


  // Filter and sort hotels
  const filteredHotels = initialHotels
    .filter(hotel => {
      // Filter by search query
      if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by type
      if (selectedType !== 'all' && hotel.type !== selectedType) {
        return false;
      }

      // Filter by price range
      const priceInThousands = hotel.price / 1000;
      if (priceInThousands < priceRange[0] || priceInThousands > priceRange[1]) {
        return false;
      }

      // Filter by amenities
      if (selectedAmenities.length > 0 &&
        !selectedAmenities.every(a =>
          hotel.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase()))
        )) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0; // Recommended order (original order)
      }
    });

  const nights = checkIn && checkOut ?
    Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="fh-dashboard">
      {/* SIDEBAR */}
      <aside className="fh-sidebar">
        <div className="fh-brand">
          <div className="fh-logo"><span>Lodgix</span></div>
        </div>

        <nav className="fh-nav">
          <button className="nav-item active">
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

      {/* MAIN AREA */}
      <main className="fh-main">
        {/* SEARCH BAR */}
        <div className="search-container">
          <div className="search-bar">
            <div className="search-field location">
              <FaMapMarkerAlt className="search-icon" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="search-field date">
              <FaCalendarAlt className="search-icon" />
              <input
                type="date"
                placeholder="Check-in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="search-field date">
              <FaCalendarAlt className="search-icon" />
              <input
                type="date"
                placeholder="Check-out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
              />
            </div>

            <div className="search-field guests">
              <FaUserFriends className="search-icon" />
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>

            <button className="search-btn">
              <FaSearch />
            </button>
          </div>

          <div className="search-filters">
            <div className="property-types-wrapper">
              <div className="property-types">
                {hotelTypes.map(type => (
                  <button
                    key={type.id}
                    className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
                    onClick={() => setSelectedType(type.id)}
                    aria-label={type.name}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-name">{type.name}</span>
                  </button>
                ))}
              </div>

              <button
                className="filter-btn desktop-filter"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filters-section"
              >
                <span>Filters</span>
                <IoIosArrowDown className={`arrow ${showFilters ? 'up' : ''}`} />
              </button>

              <button
                className="filter-btn mobile-filter"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filters-section"
              >
                <FaFilter />
                <span>Filters</span>
                {filtersCount > 0 && <span className="filter-badge">{filtersCount}</span>}
              </button>
            </div>

            {/* Mobile Filters Overlay */}
            <div className={`mobile-filters-overlay ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(false)}></div>

            {/* Filters Panel */}
            <div
              id="filters-section"
              className={`filters-panel ${showFilters ? 'active' : ''}`}
              aria-hidden={!showFilters}
            >
              <div className="filter-section">
                <h4>Price Range (per night)</h4>
                <div className="price-range">
                  <span>₹{priceRange[0] * 1000}</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                  />
                  <span>₹{priceRange[1] * 1000}+</span>
                </div>
              </div>

              <div className="filter-section">
                <h4>Amenities</h4>
                <div className="amenities-grid">
                  {amenities.map(amenity => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-actions">
                <button className="clear-btn" onClick={() => setSelectedAmenities([])}>
                  Clear all
                </button>
                <button
                  className="apply-btn"
                  onClick={() => setShowFilters(false)}
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <section className="fh-content">
          {/* RIGHT: Main panels */}
          <div className="fh-right">
            {/* User Summary cards */}
            <div className="summary-row">
              <div className="card small">
                <div className="card-title">Welcome back!</div>
                <div className="card-value">Ready for your next adventure?</div>
                <div className="card-trend">Discover amazing places</div>
              </div>
              <div className="card small">
                <div className="card-title">My Trips</div>
                <div className="card-value">{bookings.length}</div>
                <div className="card-trend">Upcoming & past stays</div>
              </div>
              <div className="card small">
                <div className="card-title">Favorites</div>
                <div className="card-value">{favorites.length}</div>
                <div className="card-trend">Saved for later</div>
              </div>
              <div className="card small">
                <div className="card-title">Member Since</div>
                <div className="card-value">2024</div>
                <div className="card-trend">Premium member</div>
              </div>
            </div>

            {/* Search results header */}
            <div className="search-controls">
              <div className="results-count">
                <span>{hotels.length} properties found</span>
                <button
                  className="sort-btn"
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  aria-expanded={showSortOptions}
                  aria-haspopup="listbox"
                >
                  <span>Sort by: {sortOptions.find(opt => opt.id === sortBy)?.name}</span>
                  <IoIosArrowDown className={`arrow ${showSortOptions ? 'up' : ''}`} />
                </button>a

                {showSortOptions && (
                  <div className="sort-dropdown">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        className={`sort-option ${sortBy === option.id ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortOptions(false);
                        }}
                      >
                        {option.name}
                        {sortBy === option.id && <FaCheck />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="view-toggle">
                <button
                  className={`view-option ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FaTh />
                </button>
                <button
                  className={`view-option ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FaList />
                </button>
              </div>
            </div>

            <div className="search-results">
              <h2>Search Results</h2>
              <div className="results-sort">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hotels list */}
            <div className="hotels-list">
              {filteredHotels.length > 0 ? (
                filteredHotels.map(hotel => (
                  <div className="hotel-card" key={hotel.id}>
                    <div className="hotel-image">
                      <img src={hotel.image} alt={hotel.name} />
                      <div className="hotel-discount" style={{ display: hotel.discount ? 'block' : 'none' }}>
                        -{hotel.discount}%
                      </div>
                      <button
                        className={`favorite-btn ${hotel.favorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(hotel.id)}
                      >
                        {hotel.favorite ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>

                    <div className="hotel-details">
                      <div className="hotel-header">
                        <h3 className="hotel-name">{hotel.name}</h3>
                        <div className="hotel-rating">
                          <FaStar className="star-icon" />
                          <span>{hotel.rating}</span>
                          <span className="reviews">({hotel.reviews})</span>
                        </div>
                      </div>

                      <div className="hotel-location">
                        <FaMapMarkerAlt className="location-icon" />
                        <span>{hotel.address}</span>
                      </div>

                      <div className="hotel-amenities">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="amenity-more">+{hotel.amenities.length - 3} more</span>
                        )}
                      </div>

                      <div className="hotel-footer">
                        <div className="price-section">
                          <div className="price">
                            ₹{hotel.price.toLocaleString('en-IN')}
                            <span className="per-night">/night</span>
                          </div>
                          {hotel.discount > 0 && (
                            <div className="original-price">
                              ₹{(hotel.price / (1 - hotel.discount / 100)).toFixed(0)}
                            </div>
                          )}
                        </div>
                        <button
                          className="view-details-btn"
                          onClick={() => navigate(`/hotel/${hotel.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <h3>No hotels found matching your criteria</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Favorite Hotels */}
            <div className="favorites-section">
              <div className="section-header">
                <h3>My Favorite Hotels</h3>
                <button className="view-all" onClick={() => navigate("/favorites")}>View All</button>
              </div>

              {favorites.length > 0 ? (
                <div className="hotels-list">
                  {initialHotels
                    .filter(hotel => favorites.includes(hotel.id))
                    .slice(0, 3)
                    .map(hotel => (
                      <div className="hotel-card" key={hotel.id}>
                        <div className="hotel-image">
                          <img src={hotel.image} alt={hotel.name} />
                          <button
                            className="favorite-btn active"
                            onClick={() => toggleFavorite(hotel.id)}
                          >
                            <FaHeart />
                          </button>
                        </div>
                        <div className="hotel-details">
                          <div className="hotel-header">
                            <h3 className="hotel-name">{hotel.name}</h3>
                            <div className="hotel-rating">
                              <FaStar className="star-icon" />
                              <span>{hotel.rating}</span>
                            </div>
                          </div>
                          <div className="hotel-location">
                            <FaMapMarkerAlt className="location-icon" />
                            <span>{hotel.address}</span>
                          </div>
                          <div className="hotel-footer">
                            <div className="price">
                              ₹{hotel.price.toLocaleString('en-IN')}
                              <span className="per-night">/night</span>
                            </div>
                            <button
                              className="view-details-btn"
                              onClick={() => navigate(`/hotel/${hotel.id}`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="no-favorites">
                  <FaHeart size={48} />
                  <h4>No favorite hotels yet</h4>
                  <p>Start exploring and save your favorite hotels for easy access later!</p>
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="recent-bookings">
              <div className="section-header">
                <h3>My Recent Trips</h3>
                <button className="view-all" onClick={() => navigate("/bookings")}>View All</button>
              </div>

              {bookings.length > 0 ? (
                <div className="bookings-list">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.receiptId} className="booking-item">
                      <div className="booking-info">
                        <div className="booking-hotel">{booking.hotelName}</div>
                        <div className="booking-dates">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div className="booking-status">
                          <span className={`status ${booking.status}`}>{booking.status}</span>
                        </div>
                      </div>
                      <div className="booking-amount">₹{booking.totalAmount?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <FaBed size={48} />
                  <h4>No trips yet</h4>
                  <p>Start planning your next adventure by searching for hotels above!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;