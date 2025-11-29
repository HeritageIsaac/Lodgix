import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdOutlineDashboard,
  MdOutlineHotel,
  MdOutlineAttachMoney,
} from "react-icons/md";
import { FaHeart, FaRegHeart, FaUserCircle, FaBed, FaBell } from "react-icons/fa";
import "./hoteldetail.css";

import { hotels as fallbackHotels } from './dummyData';

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch data from an API here.
    // For now, we'll use the dummy data.
    const selectedHotel = fallbackHotels.find((h) => h.id === parseInt(id));
    setHotel(selectedHotel || null);

    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    setFavorites(savedFavorites);

    // Load bookings from localStorage (similar to dashboard)
    const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    setBookings(savedBookings);
  }, [id]);

  if (!hotel) return <h2 className="no-data">Hotel not found</h2>;

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);

  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + hotel.images.length) % hotel.images.length
    );

  const toggleFavorite = () => {
    const hotelId = hotel.id;
    const updatedFavorites = favorites.includes(hotelId)
      ? favorites.filter(favId => favId !== hotelId)
      : [...favorites, hotelId];

    setFavorites(updatedFavorites);
    localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));

    // Update hotel favorite status in localStorage for consistency
    const updatedHotels = fallbackHotels.map(h =>
      h.id === hotelId ? { ...h, favorite: !favorites.includes(hotelId) } : h
    );
  };

  return (
    <div className="fh-dashboard">
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="fh-main">
        <header className="topbar">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">{hotel.name}</h1>
        </header>

        <div className="hotel-details-page container">
          {/* Carousel */}
          <div className="card carousel">
            <img
              src={hotel.images[currentImageIndex]}
              alt={`${hotel.name} view`}
              className="carousel-image"
            />
            <button onClick={prevImage} className="carousel-btn prev">
              &larr;
            </button>
            <button onClick={nextImage} className="carousel-btn next">
              &rarr;
            </button>
            <div className="carousel-indicators">
              {hotel.images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                ></span>
              ))}
            </div>
          </div>

          {/* Hotel Info */}
          <div className="card hotel-info">
            <div className="hotel-header">
              <div className="hotel-main-info">
                <h2 className="hotel-name">{hotel.name}</h2>
                <p className="hotel-address">{hotel.address}</p>
                <div className="rating">
                  <span className="stars">
                    {"★".repeat(Math.floor(hotel.rating))}
                  </span>
                  <span className="reviews">({hotel.reviews} reviews)</span>
                </div>
              </div>
              <button
                onClick={toggleFavorite}
                className={`favorite-floating-btn ${favorites.includes(hotel.id) ? 'active' : ''}`}
                title={favorites.includes(hotel.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span className="heart-icon">
                  {favorites.includes(hotel.id) ? '♥' : '♡'}
                </span>
              </button>
            </div>
            <div className="price">
              <span className="current-price">
                ₹{hotel.price.toLocaleString("en-IN")} / night
              </span>
              {hotel.discount > 0 && (
                <span className="discount">-{hotel.discount}%</span>
              )}
            </div>
            <button
              onClick={() => navigate("/book", { state: { hotel } })}
              className="book-button"
            >
              Book Now
            </button>
          </div>

          {/* Description */}
          <div className="card description">
            <h3>About {hotel.name}</h3>
            <p>{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div className="card amenities">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {hotel.amenities.map((a, i) => (
                <span key={i} className="amenity">
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="card facilities">
            <h3>Facilities</h3>
            <ul>
              {hotel.facilities.map((f, i) => (
                <li key={i}>
                  <strong>{f.name}: </strong> {f.details}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
