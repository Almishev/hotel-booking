# Phegon Hotel - Next.js Frontend

This is the Next.js version of the Phegon Hotel booking system, migrated from React.js.

## Features

- **Multi-language support**: Bulgarian, Greek, and English
- **User authentication**: Login and registration
- **Room management**: Browse, search, and book rooms
- **Admin panel**: Manage rooms and bookings
- **Protected routes**: User and admin route protection
- **Responsive design**: Mobile-friendly interface

## Project Structure

```
app/
├── (auth)/          # Authentication pages
│   ├── login/
│   └── register/
├── (public)/        # Public pages
│   ├── home/
│   ├── rooms/
│   └── find-booking/
├── (protected)/     # Protected user pages
│   ├── profile/
│   └── room-details-book/[roomId]/
└── (admin)/         # Admin pages
    └── admin/
        ├── manage-rooms/
        ├── manage-bookings/
        ├── add-room/
        ├── edit-room/[roomId]/
        └── edit-booking/[bookingCode]/
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the API URL in `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **i18next** - Internationalization
- **Axios** - HTTP client
- **react-datepicker** - Date picker component
- **date-fns** - Date utilities

## API Integration

The application connects to a backend API. Configure the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Route Groups

This project uses Next.js route groups:
- `(auth)` - Authentication routes
- `(public)` - Public routes
- `(protected)` - Protected user routes
- `(admin)` - Admin routes

Route groups are used for organization and don't affect the URL structure.

## Authentication

- User authentication is handled via JWT tokens stored in localStorage
- Protected routes use the `ProtectedRoute` component
- Admin routes use the `AdminRoute` component

## Internationalization

The app supports three languages:
- English (en) - Default
- Bulgarian (bg)
- Greek (el)

Language can be changed via the language selector in the navbar.

## License

Private project - All rights reserved
