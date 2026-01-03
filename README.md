# Phegon Hotel - Hotel Booking & Management System

A comprehensive full-stack web application for hotel room booking and management operations. The system provides an intuitive interface for guests to book rooms and a complete administrative panel for hotel management.

## 🚀 Features

### 👥 For Guests (Public Features)

#### 🏠 Home Page
- Beautiful landing page with hero section
- Search for available rooms by dates and type
- View hotel amenities (AC, mini-bar, parking, WiFi)
- Direct navigation to all rooms

#### 🛏️ Room Browsing
- List of all available rooms
- Filter by room type
- Detailed information for each room (price, description, images)
- Availability check by dates

#### 📅 Room Booking
- Select check-in and check-out dates
- Specify number of adults and children
- Automatic total price calculation
- Booking confirmation with unique code
- Email and SMS notifications with details

#### 📦 Holiday Packages
- Browse and book holiday packages
- Package details with included services
- Combined room and package bookings

#### 🔍 Booking Search
- Search for booking by confirmation code
- View booking details
- Room information and guest data

### 👤 For Registered Users

#### 👤 User Profile
- View personal information
- List of all user bookings
- Edit profile information
- Delete account

#### 🔐 Authentication
- Registration with email, name, phone, and password
- Login with email and password
- JWT token for secure authentication
- Protected routes for personal information

### 👨‍💼 For Administrators

#### 📊 Admin Dashboard
- Statistics for total bookings
- Total revenue from bookings
- Active bookings at the moment
- Analytics by periods

#### 🏨 Room Management
- **Add new rooms** with type, price, description, and image
- **Edit existing rooms** (all fields)
- **Delete rooms** with confirmation
- **View all rooms** with pagination

#### 📋 Booking Management
- **View all bookings** with advanced filters:
  - Search by confirmation code
  - Filter by dates (from/to)
  - Filter by room type
  - Filter by number of guests
  - Filter by status (active, current, completed)
- **Sorting** by various fields
- **Edit bookings** (dates, number of guests)
- **Cancel bookings**
- **Export data** to CSV format
- **Analytics** by periods with detailed statistics

#### 📦 Holiday Package Management
- **Add new packages** with details and pricing
- **Edit existing packages**
- **Delete packages**
- **View all packages** with management options

#### 📈 Analytics & Reports
- Booking statistics by periods
- Guest analysis (adults/children)
- Total number of guests by periods
- Data export for external processing

## 🌐 Multi-language Support

The application supports three languages:
- **Bulgarian** (default)
- **English**
- **Greek**

All interface texts are translated and can be changed dynamically.

## 🏗️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **React 19** - Modern React with functional components and Hooks
- **Tailwind CSS 4** - Utility-first CSS framework for responsive design
- **i18next** - Internationalization library for multi-language support
- **Axios** - HTTP client for API requests
- **react-datepicker** - Date picker component
- **date-fns** - Date utility library

### Backend
- **Spring Boot 3.3.0** - Java framework for building web applications
- **Java 21** - Modern Java with latest features
- **Spring Security** - Authentication and authorization with JWT
- **Spring Data JPA** - Data persistence layer
- **Hibernate** - ORM (Object-Relational Mapping)
- **PostgreSQL** - Relational database management system
- **JWT (JSON Web Tokens)** - Secure token-based authentication
- **Lombok** - Reduces boilerplate code
- **Maven** - Dependency management and build tool

### Infrastructure & DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and web server
- **GitHub Actions** - CI/CD for automated deployment
- **Hetzner Cloud** - Cloud hosting platform

### Third-party Services
- **Cloudinary** - Cloud-based image storage and optimization
- **Gmail SMTP** - Email service for booking confirmations

## 🔒 Security

### Authentication & Authorization
- **JWT tokens** for secure authentication
- **Role-based access control** (USER, ADMIN) for access management
- **Protected routes** for personal and administrative information
- **Input validation** on all endpoints

### Data Protection
- **Password hashing** with Spring Security BCrypt
- **Date validation** (cannot book for past dates)
- **Unique confirmation codes** for bookings
- **SQL injection protection** through JPA
- **CORS configuration** for secure cross-origin requests

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** computers
- **Tablets**
- **Smartphones** (optimized for mobile devices)

## 🗄️ Database Schema

### Users
- Email, name, phone, password
- Role (USER/ADMIN)
- List of bookings
- Preferred language

### Rooms
- Room type, price, description
- Image URL (stored in Cloudinary)
- List of bookings

### Bookings
- Check-in/check-out dates
- Number of adults and children
- Confirmation code
- Relationship with user and room
- Optional holiday package

### Holiday Packages
- Package name, description, price
- Included services
- Related bookings

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.9.0
- npm >= 10.0.0
- Java 21
- Maven 3.9+
- PostgreSQL 16+
- Docker & Docker Compose (for containerized deployment)

### Development Setup

#### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend will run on port 8081

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on port 3000

### Docker Deployment

#### Development
```bash
cp env.example .env.development
# Edit .env.development with your values
cp .env.development .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

#### Production
```bash
cp env.example .env.production
# Edit .env.production with your production values
cp .env.production .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

See `README-ENVIRONMENTS.md` for detailed environment configuration.

### Configuration
- Configure `application.properties` for database connection
- Add Cloudinary credentials
- Configure email service (SMTP)
- Set up environment variables (see `env.example`)

## 📊 Project Structure

```
.
├── backend/              # Spring Boot backend
│   ├── src/
│   │   └── main/java/com/phegondev/PhegonHotel/
│   │       ├── controller/    # REST controllers
│   │       ├── service/       # Business logic
│   │       ├── entity/        # JPA entities
│   │       ├── security/      # Security configuration
│   │       └── utils/         # Utility classes
│   └── pom.xml
├── frontend/             # Next.js frontend
│   ├── app/              # Next.js App Router
│   │   ├── (public)/     # Public pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (protected)/  # Protected user pages
│   │   └── (admin)/     # Admin pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and services
│   └── package.json
├── nginx/                # Nginx configuration
├── database/             # Database scripts
├── docker-compose.yml    # Docker Compose configuration
└── .github/workflows/    # GitHub Actions CI/CD
```

## 🎯 Key Advantages

1. **Intuitive Interface** - Easy to use for guests
2. **Complete Administrative Functionality** - Manage all aspects of the hotel
3. **Multi-language Support** - Accessible for international guests
4. **Responsive Design** - Works on all devices
5. **Security** - Protected with JWT and role-based access
6. **Analytics** - Detailed reports for management
7. **Automation** - Automatic notifications and confirmation codes
8. **Modern Stack** - Built with latest technologies
9. **Containerized** - Easy deployment with Docker
10. **CI/CD** - Automated deployment with GitHub Actions

## 🔮 Future Enhancements

- Payment system integration
- Review and rating system
- Channel manager integration
- Push notifications
- Mobile application
- POS system integration
- Real-time availability updates
- Advanced reporting and analytics

## 📚 Documentation

- `README-ENVIRONMENTS.md` - Environment configuration guide
- `SERVER-SETUP.md` - Server setup instructions
- `DATABASE-MIGRATION.md` - Database migration guide
- `HETZNER-DEPLOYMENT-GUIDE.md` - Hetzner deployment guide
- `DOCKER-DEPLOYMENT.md` - Docker deployment guide

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

## 📄 License

See LICENSE file for details.

---

**Phegon Hotel** - Your reliable partner for hotel business management! 🏨✨
