export const hotels = [
  {
    id: 1,
    name: 'Grand Hyatt Mumbai',
    address: 'Off Western Express Highway, Mumbai',
    rating: 4.7,
    reviews: 1245,
    stars: 5,
    type: 'hotel',
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Airport Shuttle'],
    price: 12500,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
    ],
    description:
      'Experience luxury at Grand Hyatt Mumbai, a 5-star hotel offering world-class amenities and exceptional service. Perfectly located for both business and leisure travelers.',
    facilities: [
      { name: 'Rooms', details: '547 luxurious rooms and suites' },
      { name: 'Dining', details: '4 restaurants offering global cuisines' },
      { name: 'Wellness', details: 'Full-service spa and 24/7 fitness center' },
    ],
    roomTypes: [
      { id: 'ordinary', name: 'Ordinary Room', price: 8500, description: 'Comfortable room with essential amenities' },
      { id: 'deluxe', name: 'Deluxe Room', price: 12500, description: 'Spacious room with premium amenities and city view' },
      { id: 'presidential', name: 'Presidential Suite', price: 35000, description: 'Luxurious suite with separate living area and premium services' }
    ],
    favorite: false,
  },
  {
    id: 2,
    name: 'Taj Lands End',
    address: 'Bandra West, Mumbai',
    rating: 4.8,
    reviews: 2310,
    stars: 5,
    type: 'hotel',
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Beach View', 'Parking'],
    price: 18900,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
    ],
    description:
      'Overlooking the Arabian Sea, Taj Lands End offers breathtaking views and legendary hospitality. A landmark of luxury in the queen of suburbs.',
    facilities: [
      { name: 'Rooms', details: '493 sea-facing rooms and suites' },
      { name: 'Dining', details: 'Award-winning restaurants and a vibrant bar' },
      { name: 'Events', details: 'Extensive banquet and conference facilities' },
    ],
    roomTypes: [
      { id: 'ordinary', name: 'Sea View Room', price: 12000, description: 'Comfortable room with sea view' },
      { id: 'deluxe', name: 'Deluxe Sea View', price: 18900, description: 'Spacious room with panoramic sea views' },
      { id: 'presidential', name: 'Presidential Suite', price: 45000, description: 'Ultra-luxurious suite with private balcony and butler service' }
    ],
    favorite: true,
  },
  {
    id: 3,
    name: 'The Leela Palace',
    address: 'Sahar, Mumbai',
    rating: 4.6,
    reviews: 1876,
    stars: 5,
    type: 'resort',
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Airport Shuttle', 'Gym'],
    price: 21500,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
    ],
    description:
      'An oasis of tranquility, The Leela Palace is set amidst acres of lush gardens. It combines modern luxury with traditional Indian aesthetics.',
    facilities: [
      { name: 'Rooms', details: '394 elegantly appointed rooms' },
      { name: 'Pool', details: 'Lagoon-style swimming pool' },
      { name: 'Spa', details: 'ESPA, a world-renowned wellness center' },
    ],
    roomTypes: [
      { id: 'ordinary', name: 'Garden View Room', price: 15000, description: 'Comfortable room overlooking the gardens' },
      { id: 'deluxe', name: 'Deluxe Garden View', price: 21500, description: 'Spacious room with garden views and premium amenities' },
      { id: 'presidential', name: 'Royal Suite', price: 55000, description: 'Opulent suite with private pool and personalized butler service' }
    ],
    favorite: false,
  },
];
