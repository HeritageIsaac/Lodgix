import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaStar, FaMapMarkerAlt, FaBed, FaWifi, FaSwimmingPool, FaParking, FaUtensils } from 'react-icons/fa';
import './AdminLayout.css';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 8;

  // Mock data - replace with API call
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // Replace with actual API call
        const mockHotels = Array(12).fill().map((_, i) => ({
          id: i + 1,
          name: `Luxury Hotel ${i + 1}`,
          location: ['New York', 'Paris', 'Tokyo', 'London', 'Dubai'][i % 5],
          price: 150 + (i * 25),
          rating: (4 + Math.random()).toFixed(1),
          rooms: 50 + (i * 5),
          amenities: {
            wifi: i % 2 === 0,
            pool: i % 3 === 0,
            parking: i % 4 === 0,
            restaurant: i % 2 !== 0
          },
          status: i % 5 === 0 ? 'Inactive' : 'Active',
          image: `https://source.unsplash.com/random/300x200?hotel,${i}`
        }));
        
        setHotels(mockHotels);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Filter hotels based on search term
  const filteredHotels = hotels.filter(hotel => 
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current hotels for pagination
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = (hotelId) => {
    // Replace with actual delete API call
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
    }
  };

  const toggleStatus = (hotelId) => {
    setHotels(hotels.map(hotel => 
      hotel.id === hotelId 
        ? { ...hotel, status: hotel.status === 'Active' ? 'Inactive' : 'Active' } 
        : hotel
    ));
  };

  if (loading) {
    return <div className="loading">Loading hotels...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Hotel Management</h1>
        <button className="btn btn-primary">
          <FaPlus className="mr-2" /> Add Hotel
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-options">
          <select className="form-control">
            <option>All Locations</option>
            <option>New York</option>
            <option>Paris</option>
            <option>Tokyo</option>
            <option>London</option>
            <option>Dubai</option>
          </select>
          <select className="form-control">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className="form-control">
            <option>Sort By</option>
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
            <option>Price (Low to High)</option>
            <option>Price (High to Low)</option>
            <option>Rating (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="hotel-grid">
        {currentHotels.length > 0 ? (
          currentHotels.map((hotel) => (
            <div key={hotel.id} className="hotel-card">
              <div className="hotel-image">
                <img src={hotel.image} alt={hotel.name} />
                <div className="hotel-status">
                  <span className={`status-badge ${hotel.status.toLowerCase()}`}>
                    {hotel.status}
                  </span>
                </div>
                <div className="hotel-rating">
                  <FaStar className="star-icon" />
                  <span>{hotel.rating}</span>
                </div>
              </div>
              <div className="hotel-details">
                <h3>{hotel.name}</h3>
                <div className="hotel-location">
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{hotel.location}</span>
                </div>
                <div className="hotel-rooms">
                  <FaBed className="room-icon" />
                  <span>{hotel.rooms} Rooms</span>
                </div>
                <div className="hotel-amenities">
                  {hotel.amenities.wifi && <span className="amenity" title="Free WiFi"><FaWifi /></span>}
                  {hotel.amenities.pool && <span className="amenity" title="Swimming Pool"><FaSwimmingPool /></span>}
                  {hotel.amenities.parking && <span className="amenity" title="Free Parking"><FaParking /></span>}
                  {hotel.amenities.restaurant && <span className="amenity" title="Restaurant"><FaUtensils /></span>}
                </div>
                <div className="hotel-footer">
                  <div className="hotel-price">
                    <span className="price">${hotel.price}</span>
                    <span className="per-night">/ night</span>
                  </div>
                  <div className="hotel-actions">
                    <button 
                      className={`status-toggle ${hotel.status.toLowerCase()}`}
                      onClick={() => toggleStatus(hotel.id)}
                    >
                      {hotel.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-icon" title="Edit">
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      title="Delete"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No hotels found matching your search criteria.</p>
          </div>
        )}
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

export default Hotels;
