import React, { useState, useEffect } from 'react';
import { Star, MapPin, MessageCircle, Heart, ChevronRight, Search, Filter, LogOut, Menu, X, Upload, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { guidesAPI } from './api';

// Fallback sample data — shown only if the live API can't be reached yet
// (e.g. backend cold-starting on a free tier) or the database is empty.
const mockGuides = [
  {
    id: 1,
    name: 'Giorgi Beridze',
    location: 'Tbilisi',
    languages: ['Georgian', 'English', 'Russian'],
    description: 'Expert in Old Town history and Georgian wine. 15+ years experience.',
    profileImage: '👨‍🏫',
    rating: 4.8,
    reviews: 127,
    tours: [
      { id: 1, name: 'Old Tbilisi Walking Tour', price: 45, duration: '3 hours' },
      { id: 2, name: 'Wine Tasting Experience', price: 60, duration: '4 hours' }
    ],
    photos: ['🏰', '🍷', '🏛️'],
    availability: 'Available',
    verified: true
  },
  {
    id: 2,
    name: 'Nino Kvaratskhelia',
    location: 'Kazbegi',
    languages: ['Georgian', 'English'],
    description: 'Mountain trekking specialist. Leads groups to Gergeti Trinity Church.',
    profileImage: '👩‍🏕️',
    rating: 4.9,
    reviews: 89,
    tours: [
      { id: 3, name: 'Gergeti Trek', price: 55, duration: '5 hours' },
      { id: 4, name: 'Dariel Gorge Adventure', price: 75, duration: '6 hours' }
    ],
    photos: ['⛰️', '🏔️', '🗻'],
    availability: 'Available',
    verified: true
  },
  {
    id: 3,
    name: 'Levan Gvalia',
    location: 'Batumi',
    languages: ['Georgian', 'English', 'French'],
    description: 'Coastal tours and botanical garden specialist.',
    profileImage: '🧑‍🎓',
    rating: 4.7,
    reviews: 65,
    tours: [
      { id: 5, name: 'Batumi Beach Tour', price: 40, duration: '2.5 hours' },
      { id: 6, name: 'Botanical Gardens', price: 35, duration: '2 hours' }
    ],
    photos: ['🏖️', '🌺', '🌊'],
    availability: 'Available',
    verified: true
  },
  {
    id: 4,
    name: 'Ketevan Jikia',
    location: 'Signagi',
    languages: ['Georgian', 'English', 'German'],
    description: 'Wine region expert. Visits to local vineyards and cultural sites.',
    profileImage: '👩‍🍳',
    rating: 4.6,
    reviews: 92,
    tours: [
      { id: 7, name: 'Kakheti Wine Tour', price: 65, duration: '5 hours' },
      { id: 8, name: 'Signagi Cultural Walk', price: 30, duration: '2 hours' }
    ],
    photos: ['🍇', '🏘️', '🥂'],
    availability: 'Available',
    verified: true
  },
  {
    id: 5,
    name: 'Davit Beridze',
    location: 'Kutaisi',
    languages: ['Georgian', 'English', 'Spanish'],
    description: 'Cave exploration and historical site tours.',
    profileImage: '🧗',
    rating: 4.8,
    reviews: 56,
    tours: [
      { id: 9, name: 'Prometheus Cave Tour', price: 40, duration: '3 hours' },
      { id: 10, name: 'Gelati Monastery', price: 35, duration: '2.5 hours' }
    ],
    photos: ['🕳️', '🙏', '⛪'],
    availability: 'Available',
    verified: true
  }
];

const TouristGuideMarketplace = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchParams, setSearchParams] = useState({ location: '', language: '', priceRange: 'all', rating: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load guides from the live backend. Falls back to mock data if the API
  // is unreachable (e.g. still starting up on a free Render instance) or
  // the database hasn't been seeded yet.
  useEffect(() => {
    let cancelled = false;

    const loadGuides = async () => {
      try {
        const response = await guidesAPI.getAll();
        if (!cancelled && Array.isArray(response.data) && response.data.length > 0) {
          const normalized = response.data.map(g => ({ ...g, id: g.id || g._id }));
          setGuides(normalized);
          setFilteredGuides(normalized);
          return;
        }
      } catch (err) {
        console.warn('Falling back to sample guides — API not reachable yet:', err.message);
      }
      if (!cancelled) {
        setGuides(mockGuides);
        setFilteredGuides(mockGuides);
      }
    };

    loadGuides();
    return () => { cancelled = true; };
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = guides;

    if (searchParams.location) {
      filtered = filtered.filter(g => g.location.toLowerCase().includes(searchParams.location.toLowerCase()));
    }

    if (searchParams.language) {
      filtered = filtered.filter(g => g.languages.includes(searchParams.language));
    }

    if (searchParams.rating > 0) {
      filtered = filtered.filter(g => g.rating >= searchParams.rating);
    }

    if (searchParams.priceRange !== 'all') {
      filtered = filtered.filter(g => {
        const minPrice = Math.min(...g.tours.map(t => t.price));
        if (searchParams.priceRange === 'under50') return minPrice < 50;
        if (searchParams.priceRange === '50-100') return minPrice >= 50 && minPrice <= 100;
        if (searchParams.priceRange === 'over100') return minPrice > 100;
        return true;
      });
    }

    setFilteredGuides(filtered);
  }, [searchParams, guides]);

  // Authentication pages
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Welcome Back</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          setCurrentUser({ type: 'tourist', name: 'Tourist User' });
          setCurrentPage('home');
        }}>
          <input type="email" placeholder="Email" className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="Password" className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">Sign In</button>
        </form>
        <p className="text-center mt-4 text-gray-600">Don't have an account? <button onClick={() => setCurrentPage('register')} className="text-blue-600 font-semibold">Sign Up</button></p>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Join as Guide or Tourist</h1>
        <div className="space-y-4">
          <button onClick={() => {
            setCurrentUser({ type: 'guide', name: 'New Guide' });
            setCurrentPage('guide-setup');
          }} className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">Register as Guide</button>
          <button onClick={() => {
            setCurrentUser({ type: 'tourist', name: 'Tourist User' });
            setCurrentPage('home');
          }} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">Continue as Tourist</button>
        </div>
        <p className="text-center mt-4 text-gray-600">Already have an account? <button onClick={() => setCurrentPage('login')} className="text-blue-600 font-semibold">Sign In</button></p>
      </div>
    </div>
  );

  // HomePage with Hero and Search
  const HomePage = () => (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Discover Georgia Through Local Guides</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Experience authentic culture, history, and nature with verified expert guides</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input type="text" placeholder="Tbilisi, Batumi, Kazbegi..." value={searchParams.location} onChange={(e) => setSearchParams({...searchParams, location: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                <select value={searchParams.language} onChange={(e) => setSearchParams({...searchParams, language: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Russian">Russian</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <select value={searchParams.priceRange} onChange={(e) => setSearchParams({...searchParams, priceRange: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                  <option value="all">All Prices</option>
                  <option value="under50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="over100">Over $100</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select value={searchParams.rating} onChange={(e) => setSearchParams({...searchParams, rating: parseFloat(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Guides */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-12 text-gray-900">Browse Verified Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onSelect={() => {
              setSelectedGuide(guide);
              setCurrentPage('guide-detail');
            }} />
          ))}
        </div>
      </div>
    </div>
  );

  const GuideCard = ({ guide, onSelect }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-200 overflow-hidden" onClick={onSelect}>
      <div className="bg-gradient-to-r from-blue-400 to-teal-400 h-48 flex items-center justify-center text-6xl">{guide.profileImage}</div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{guide.name}</h3>
          {guide.verified && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Verified</span>}
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" /> {guide.location}
        </div>
        <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(guide.rating) ? 'currentColor' : 'none'} />)}
          </div>
          <span className="text-gray-700 font-semibold ml-2">{guide.rating}</span>
          <span className="text-gray-500 text-sm ml-1">({guide.reviews})</span>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Languages: {guide.languages.join(', ')}</p>
          <p className="text-sm text-blue-600 font-semibold">From ${Math.min(...guide.tours.map(t => t.price))}/tour</p>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">View Profile</button>
      </div>
    </div>
  );

  // Guide Detail Page
  const GuideDetailPage = () => (
    <div className="min-h-screen bg-gray-50">
      {selectedGuide && (
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Guide Header */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="text-9xl">{selectedGuide.profileImage}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{selectedGuide.name}</h1>
                  {selectedGuide.verified && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Verified Guide</span>}
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={20} className="mr-2" /> {selectedGuide.location}
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < Math.floor(selectedGuide.rating) ? 'currentColor' : 'none'} />)}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{selectedGuide.rating}</span>
                  <span className="text-gray-500 ml-2">({selectedGuide.reviews} reviews)</span>
                </div>
                <p className="text-gray-700 mb-4">{selectedGuide.description}</p>
                <p className="text-gray-600 mb-4"><strong>Languages:</strong> {selectedGuide.languages.join(', ')}</p>
                <button onClick={() => setCurrentPage('contact')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Contact Guide</button>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedGuide.photos.map((photo, i) => (
                  <div key={i} className="bg-gradient-to-br from-blue-300 to-teal-300 rounded-lg h-32 flex items-center justify-center text-5xl">{photo}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Tours */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Tours</h3>
            <div className="space-y-4">
              {selectedGuide.tours.map(tour => (
                <div key={tour.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{tour.name}</h4>
                      <p className="text-gray-600">Duration: {tour.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${tour.price}</p>
                      <p className="text-gray-500 text-sm">per person</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Book Now</button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">Tourist Name {i}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">2 weeks ago</p>
                  </div>
                  <p className="text-gray-600">Amazing tour! {selectedGuide.name} is very knowledgeable and friendly. Highly recommended!</p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">Leave a Review</button>
          </div>

          <button onClick={() => setCurrentPage('home')} className="mt-8 text-blue-600 font-semibold hover:underline">← Back to Guides</button>
        </div>
      )}
    </div>
  );

  // Guide Dashboard
  const GuideDashboard = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Guide Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Profile Views</p>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Bookings</p>
            <p className="text-3xl font-bold text-green-600">24</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Rating</p>
            <p className="text-3xl font-bold text-yellow-600">4.8/5</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Revenue</p>
            <p className="text-3xl font-bold text-purple-600">$4,320</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 bg-white rounded-lg p-8 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Edit2 size={18} /> Edit
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <p className="text-gray-900 text-lg">Giorgi Beridze</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <p className="text-gray-900 text-lg">Tbilisi, Georgia</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Languages</label>
                <p className="text-gray-900 text-lg">Georgian, English, Russian</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <p className="text-gray-700">Expert in Old Town history and Georgian wine. 15+ years of guiding experience.</p>
              </div>
            </div>

            <div className="border-t mt-8 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Tours</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Old Tbilisi Walking Tour</h4>
                    <p className="text-gray-600 text-sm">$45 • 3 hours • 12 bookings</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded"><Edit2 size={18} className="text-blue-600" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><Trash2 size={18} className="text-red-600" /></button>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Wine Tasting Experience</h4>
                    <p className="text-gray-600 text-sm">$60 • 4 hours • 8 bookings</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded"><Edit2 size={18} className="text-blue-600" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded"><Trash2 size={18} className="text-red-600" /></button>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">+ Add New Tour</button>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gradient-to-br from-blue-300 to-teal-300 rounded-lg h-24 flex items-center justify-center relative group">
                  <button className="absolute p-2 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <Upload size={20} /> Upload Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Tourist Dashboard
  const TouristDashboard = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings & Reviews</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Bookings</h2>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="border rounded-lg p-6 hover:border-blue-300 transition">
                  <div className="flex gap-4">
                    <div className="text-6xl">⛰️</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">Gergeti Trek with Nino</h3>
                      <p className="text-gray-600 mb-3">July 25, 2024 • 5 hours • $55</p>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">Confirmed</span>
                    </div>
                    <button className="text-blue-600 font-semibold hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-8 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Tours</h2>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="border rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="text-6xl">🏰</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">Old Tbilisi Walking Tour</h3>
                        <p className="text-gray-600 mb-3">July 15, 2024 • 3 hours • $45</p>
                        <p className="text-gray-700">Completed by Giorgi Beridze</p>
                      </div>
                      <button onClick={() => setCurrentPage('leave-review')} className="text-blue-600 font-semibold hover:underline">Leave Review</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Guides</h2>
            <div className="space-y-4">
              {guides.slice(0, 3).map(guide => (
                <div key={guide.id} className="border rounded-lg p-4 hover:border-blue-300 transition cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{guide.profileImage}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{guide.name}</p>
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(guide.rating) ? 'currentColor' : 'none'} />)}
                      </div>
                    </div>
                    <Heart size={18} className="text-red-500 fill-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Active Guides</p>
            <p className="text-3xl font-bold text-green-600">245</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Reviews</p>
            <p className="text-3xl font-bold text-purple-600">3,456</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 mb-2">Revenue</p>
            <p className="text-3xl font-bold text-yellow-600">$45,600</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Users Management */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Users</h2>
            <div className="space-y-3">
              {['Giorgi Beridze', 'Nino Kvaratskhelia', 'John Smith', 'Maria Garcia'].map((name, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                  <p className="font-semibold text-gray-900">{name}</p>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">View</button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-semibold">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guides Verification */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Verifications</h2>
            <div className="space-y-3">
              {['New Guide A', 'New Guide B'].map((name, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-yellow-50">
                  <p className="font-semibold text-gray-900">{name}</p>
                  <div className="flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700">Approve</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Management */}
        <div className="bg-white rounded-lg p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Positive Review</p>
                  <p className="text-gray-600 text-sm mt-2">Amazing tour! Very knowledgeable guide.</p>
                  <p className="text-gray-500 text-sm mt-2">By Tourist • For Giorgi Beridze</p>
                </div>
                <button className="text-red-600 hover:text-red-700 font-semibold text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Contact Form
  const ContactPage = () => (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact {selectedGuide?.name}</h1>
        <p className="text-gray-600 mb-8">Send a message to inquire about tours or services</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          alert('Message sent! The guide will respond soon.');
          setCurrentPage('home');
        }}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Send Message</button>
        </form>
        <button onClick={() => setCurrentPage('guide-detail')} className="mt-4 text-blue-600 font-semibold hover:underline">← Back</button>
      </div>
    </div>
  );

  // Navigation Header
  const Header = () => (
    <header className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 onClick={() => setCurrentPage('home')} className="text-2xl font-bold text-blue-600 cursor-pointer">🇬🇪 TourGuide.ge</h1>
        <nav className="hidden md:flex gap-6 items-center">
          {currentUser ? (
            <>
              <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-blue-600 font-semibold">Home</button>
              {currentUser.type === 'guide' && <button onClick={() => setCurrentPage('guide-dashboard')} className="text-gray-700 hover:text-blue-600 font-semibold">My Dashboard</button>}
              {currentUser.type === 'tourist' && <button onClick={() => setCurrentPage('tourist-dashboard')} className="text-gray-700 hover:text-blue-600 font-semibold">My Bookings</button>}
              <button onClick={() => { setCurrentUser(null); setCurrentPage('home'); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage('login')} className="text-gray-700 hover:text-blue-600 font-semibold">Login</button>
              <button onClick={() => setCurrentPage('register')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Sign Up</button>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 gap-3">
            {currentUser ? (
              <>
                <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 font-semibold text-left">Home</button>
                {currentUser.type === 'guide' && <button onClick={() => { setCurrentPage('guide-dashboard'); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 font-semibold text-left">My Dashboard</button>}
                {currentUser.type === 'tourist' && <button onClick={() => { setCurrentPage('tourist-dashboard'); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-blue-600 font-semibold text-left">My Bookings</button>}
                <button onClick={() => { setCurrentUser(null); setCurrentPage('home'); setMobileMenuOpen(false); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { setCurrentPage('login'); setMobileMenuOpen(false); }} className="text-gray-700 font-semibold">Login</button>
                <button onClick={() => { setCurrentPage('register'); setMobileMenuOpen(false); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">Sign Up</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );

  return (
    <div className="min-h-screen bg-white">
      {currentUser && <Header />}
      {!currentUser && currentPage === 'login' && <LoginPage />}
      {!currentUser && currentPage === 'register' && <RegisterPage />}
      {currentUser && currentPage === 'home' && <HomePage />}
      {currentUser && currentPage === 'guide-detail' && <GuideDetailPage />}
      {currentUser && currentPage === 'contact' && <ContactPage />}
      {currentUser && currentPage === 'guide-dashboard' && currentUser.type === 'guide' && <GuideDashboard />}
      {currentUser && currentPage === 'tourist-dashboard' && currentUser.type === 'tourist' && <TouristDashboard />}
      {currentUser?.type === 'admin' && currentPage === 'admin-dashboard' && <AdminDashboard />}
    </div>
  );
};

export default TouristGuideMarketplace;
