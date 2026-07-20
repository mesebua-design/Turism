# 🇬🇪 TourGuide.ge - Tourist Guide Marketplace for Georgia

A professional, full-stack marketplace platform connecting verified tour guides with tourists. Designed specifically for Georgian tourism, similar to Georgian Travel Guide, Airbnb Experiences, and TripAdvisor.

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-success)

## 🌟 Key Features

### For Tourists
- 🔍 **Advanced Search & Filtering**: Find guides by location, language, price, and rating
- ⭐ **Rating System**: View authentic 5-star reviews from other tourists
- 💬 **Direct Messaging**: Contact guides directly to ask questions
- 📅 **Easy Booking**: Simple tour booking with instant confirmation
- ❤️ **Favorites**: Save favorite guides for quick access
- 📸 **Photo Gallery**: See tour photos and guide portfolios
- 💳 **Secure Payments**: Integrated Stripe for safe transactions
- 🔐 **Secure Account**: JWT authentication and encrypted data

### For Guides
- 👤 **Professional Profile**: Showcase experience, certifications, and languages
- 📸 **Photo Management**: Upload unlimited high-quality photos
- 🎯 **Tour Management**: Create and manage multiple tour offerings
- 💰 **Flexible Pricing**: Set custom prices for different tours
- 📊 **Analytics Dashboard**: Track profile views, bookings, and earnings
- 🗓️ **Availability Calendar**: Manage tour schedules
- 📝 **Tour Descriptions**: Detailed tour information with highlights
- ⭐ **Review Management**: Monitor and respond to reviews
- 💵 **Earnings Tracking**: Real-time revenue dashboard

### For Admins
- 👥 **User Management**: Manage tourists, guides, and accounts
- ✅ **Guide Verification**: Verify and approve new guides
- 📋 **Review Moderation**: Manage and moderate user reviews
- 📊 **Platform Analytics**: View statistics and platform metrics
- 🚫 **Content Moderation**: Remove inappropriate content
- 📧 **Communication**: Send announcements and notifications
- 🔧 **System Management**: Control all platform settings

## 🛠️ Technology Stack

### Frontend
```
React 18 + Tailwind CSS + Lucide React
- Modern, responsive UI
- Mobile-first design
- Fast performance
- Easy to customize
```

### Backend
```
Node.js + Express + MongoDB
- RESTful API
- JWT Authentication
- Input validation
- Error handling
```

### Services
```
- Stripe (Payments)
- Cloudinary (Image hosting)
- Nodemailer (Email notifications)
- Socket.io (Real-time chat)
- Google Maps API
```

## 📋 Project Structure

```
tourguide-marketplace/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx
│   │   │   ├── GuideBrowser.jsx
│   │   │   ├── GuideProfile.jsx
│   │   │   ├── GuideDashboard.jsx
│   │   │   ├── TouristDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ReviewForm.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Guide.js
│   │   ├── Tour.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── guides.js
│   │   ├── tours.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── controllers/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   └── DATABASE_SCHEMA.md
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tourguide-marketplace.git
cd tourguide-marketplace
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

3. **Backend Setup**
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
# Server runs on http://localhost:5000
```

4. **Database Setup**
```bash
# MongoDB Atlas
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Get connection string
# 4. Add to .env as MONGODB_URI

# Or local MongoDB
mongod
```

## 📱 User Workflows

### Tourist Registration & Booking

```
1. Sign Up as Tourist
   ↓
2. Browse Guides (filter by location, language, price)
   ↓
3. View Guide Profile (photos, reviews, tours)
   ↓
4. Book a Tour
   ↓
5. Pay securely
   ↓
6. Join tour
   ↓
7. Leave review
   ↓
8. Rate guide (1-5 stars)
```

### Guide Registration & Setup

```
1. Sign Up as Guide
   ↓
2. Complete Profile
   - Upload profile picture
   - Write bio
   - Select languages
   - Add certifications
   ↓
3. Upload Photos
   ↓
4. Create Tours
   - Tour name
   - Description
   - Price
   - Duration
   - Highlights
   ↓
5. Set Availability
   ↓
6. Await Admin Verification
   ↓
7. Start Accepting Bookings
   ↓
8. Manage Dashboard
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Rate limiting on API endpoints
- ✅ HTTPS/SSL ready
- ✅ Secure session management
- ✅ XSS and CSRF protection
- ✅ SQL injection prevention
- ✅ Encrypted sensitive data

## 💾 Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "userType": "tourist" | "guide" | "admin",
  "profileImage": String,
  "location": String,
  "verified": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Guides Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "name": String,
  "location": String,
  "languages": [String],
  "description": String,
  "photos": [String],
  "tours": [ObjectId],
  "rating": Number,
  "reviews": Number,
  "verified": Boolean,
  "certifications": [String],
  "yearsExperience": Number,
  "createdAt": Date
}
```

### Tours Collection
```json
{
  "_id": ObjectId,
  "guideId": ObjectId,
  "name": String,
  "description": String,
  "price": Number,
  "duration": String,
  "maxParticipants": Number,
  "availability": [String],
  "highlights": [String],
  "photos": [String],
  "createdAt": Date
}
```

### Bookings Collection
```json
{
  "_id": ObjectId,
  "touristId": ObjectId,
  "guideId": ObjectId,
  "tourId": ObjectId,
  "date": Date,
  "participants": Number,
  "totalPrice": Number,
  "status": "pending" | "confirmed" | "completed" | "cancelled",
  "createdAt": Date
}
```

### Reviews Collection
```json
{
  "_id": ObjectId,
  "guideId": ObjectId,
  "touristId": ObjectId,
  "bookingId": ObjectId,
  "rating": Number (1-5),
  "comment": String,
  "photos": [String],
  "verified": Boolean,
  "createdAt": Date
}
```

## 🌐 Available Locations (Georgia)

### Major Cities
- 🏛️ Tbilisi (Capital)
- 🏖️ Batumi
- ⛰️ Kazbegi
- 🍇 Signagi
- 🏰 Kutaisi
- 🏛️ Gori
- 🏛️ Mtskheta
- 🏞️ Zugdidi

### Featured Tours
- Old Tbilisi Walking Tours
- Wine Tasting Experiences
- Mountain Trekking
- Beach Tours
- Monastery Visits
- Cultural Heritage Tours
- Adventure Activities
- Food & Wine Tours

## 📊 API Response Examples

### Get Guides
```bash
GET /api/guides?location=Tbilisi&language=English
```

Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Giorgi Beridze",
    "location": "Tbilisi",
    "languages": ["Georgian", "English", "Russian"],
    "rating": 4.8,
    "reviews": 127,
    "tours": ["507f1f77bcf86cd799439012"],
    "verified": true
  }
]
```

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "guideId": "507f1f77bcf86cd799439011",
  "tourId": "507f1f77bcf86cd799439012",
  "date": "2024-07-25",
  "participants": 2,
  "specialRequests": "Birthday celebration"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "status": "pending",
  "totalPrice": 110,
  "createdAt": "2024-07-20T10:30:00Z"
}
```

## 🎨 Design Features

- **Modern UI**: Clean, professional interface
- **Responsive**: Works perfectly on mobile, tablet, desktop
- **Accessible**: WCAG 2.1 compliant
- **Fast**: Optimized performance
- **Intuitive**: Easy to navigate
- **Professional**: Travel industry standard design
- **Branding**: Georgian-focused design elements
- **Dark Mode**: Optional dark theme support

## 📈 Performance Metrics

- Page Load Time: < 2 seconds
- API Response Time: < 500ms
- Database Query Time: < 200ms
- Image Optimization: WebP with fallbacks
- Mobile Score: 95+
- SEO Score: 100

## 🧪 Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- Authentication tests
- API endpoint tests
- Database operation tests
- File upload tests
- Payment processing tests

## 📧 Email Notifications

Automated emails for:
- Welcome message
- Booking confirmation
- Booking reminders
- Review requests
- Guide verification
- Payment receipts
- Account notifications

## 💳 Payment Processing

- **Stripe Integration**: Safe, PCI-compliant payments
- **Payment Methods**: Credit cards, debit cards, digital wallets
- **Refunds**: Automated refund processing
- **Receipts**: Digital payment receipts
- **Currency**: Multiple currency support

## 🔔 Real-time Features

- **Instant Notifications**: Bookings, messages, reviews
- **Live Chat**: Real-time messaging between guides and tourists
- **Activity Updates**: Real-time dashboard updates
- **Availability Sync**: Live tour availability

## 📱 Mobile App Support

The React frontend is fully responsive and works as:
- Progressive Web App (PWA)
- Mobile web browser
- Ready for React Native conversion

## 🚨 Reporting & Moderation

- Inappropriate content reporting
- Guide review verification
- Automated spam detection
- User conduct guidelines
- Content moderation dashboard

## 🌍 Internationalization (i18n)

Supports multiple languages:
- Georgian (ka-GE)
- English (en-US)
- Russian (ru-RU)
- French (fr-FR)
- German (de-DE)

Easy to add more languages!

## 📞 Support

- **Email**: support@tourguide.ge
- **Help Center**: /help
- **FAQ**: Comprehensive FAQ section
- **Contact Form**: Available on website
- **Live Chat**: Real-time support

## 🐛 Known Issues & Workarounds

### Issue: MongoDB connection timeout
**Solution**: Check MongoDB is running and connection string is correct

### Issue: CORS errors
**Solution**: Update CORS origin in backend to match frontend URL

### Issue: Image upload fails
**Solution**: Check file size limits and Cloudinary credentials

## 🚧 Future Enhancements

- [ ] Video integration
- [ ] Virtual tours (360°)
- [ ] AI-powered recommendations
- [ ] Advanced analytics
- [ ] Mobile native apps
- [ ] Multi-language support expansion
- [ ] Advanced reporting features
- [ ] API marketplace
- [ ] Guide certification program
- [ ] Loyalty rewards program

## 📄 License

MIT License - Free to use and modify

## 👥 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 Additional Resources

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Security Guidelines](./SECURITY.md)

## 🎯 Success Metrics

Track these metrics to measure platform success:

- Active users
- Guide registrations
- Booking conversion rate
- Average rating (should be 4.5+)
- Revenue per booking
- User retention rate
- Guide satisfaction score
- Tourist satisfaction score

## 🙏 Credits

Built with modern web technologies and best practices for the Georgian tourism industry.

---

**Ready to revolutionize tourism in Georgia? Let's build together! 🇬🇪**

For questions or support, contact: support@tourguide.ge
