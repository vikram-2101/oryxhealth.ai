# 🏥 OxyHealth Admin Portal

> A modern, production-ready admin portal for managing Digital Health System operations with full CRUD capabilities, premium UI/UX, and comprehensive analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

OxyHealth Admin Portal is a comprehensive administrative dashboard for managing healthcare institutions, users, and medical panels. Built with modern web technologies, it provides a seamless experience for administrators to oversee customer accounts, institutions, healthcare professionals, and review panels.

**Live Demo**: [Coming Soon]

**Default Login**:
- Email: `admin@oxyhealth.ai`
- Password: `admin123`

## ✨ Features

### 🎨 Premium Dashboard
- **KPI Cards** with real-time statistics and trend indicators
- **Interactive Charts** (Line charts for growth, Pie charts for distribution)
- **Recent Activity Table** showing latest user registrations
- **Responsive Design** optimized for all screen sizes

### 👥 User Management
- Complete CRUD operations for users
- Role-based user types (Doctors, Health Workers, Coordinators)
- Conditional form fields (e.g., registration number for doctors)
- Institution assignment
- Status management (Active/Inactive)
- Advanced filtering by role and institution

### 🏢 Customer & Institution Management
- Customer account management with contact details
- Institution registration linked to customers
- Emoji-based logos for visual identification
- Contact person tracking
- Status toggles with smooth animations

### 🔧 Panel Management
- Create and manage medical review panels
- Multi-select member assignment
- Visual member avatars
- Panel status management

### 🎨 UI/UX Excellence
- **Glassmorphism** design with modern aesthetics
- **Smooth Animations** using Framer Motion
- **Form Validation** with clear error messages
- **Responsive Tables** with hover effects
- **Search & Filter** capabilities on all pages
- **Modal Forms** for add/edit operations
- **Confirmation Dialogs** for destructive actions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Chart library for analytics
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Premium dashboard with KPI cards, growth charts, and recent activity*

### Customer Management
![Customers](docs/screenshots/customers.png)
*Customer management with search, filter, and CRUD operations*

### User Management
![Users](docs/screenshots/users.png)
*User management with role-based filtering and table view*

### Forms
![Form Modal](docs/screenshots/form-modal.png)
*Beautiful modal forms with validation and smooth animations*

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB (local or Atlas account)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vikram-2101/oryxhealth.ai.git
cd oryxhealth.ai
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/oxyhealth
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

Seed the database:
```bash
npm run seed
```

Start backend server:
```bash
npm start
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend dev server:
```bash
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Login: `admin@oxyhealth.ai` / `admin123`

## 🌐 Deployment

### Quick Deployment Guide

#### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables (MongoDB URI, JWT Secret)
5. Deploy and copy backend URL

#### Frontend (Vercel)
1. Create new project on Vercel
2. Import GitHub repository
3. Set root directory to `frontend`
4. Add `VITE_API_URL` environment variable
5. Deploy

**Detailed Guide**: See [DEPLOYMENT_QUICK_REF.md](DEPLOYMENT_QUICK_REF.md)

## 📁 Project Structure

```
oxyhealth.ai/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & error handling
│   │   └── server.js       # Express app
│   ├── seed.js             # Database seeding
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/      # Form components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `PATCH /api/customers/:id/toggle-status` - Toggle status

### Institutions
- `GET /api/institutions` - Get all institutions
- `POST /api/institutions` - Create institution
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution
- `PATCH /api/institutions/:id/toggle-status` - Toggle status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle status

### Panels
- `GET /api/panels` - Get all panels
- `POST /api/panels` - Create panel
- `PUT /api/panels/:id` - Update panel
- `DELETE /api/panels/:id` - Delete panel
- `PATCH /api/panels/:id/toggle-status` - Toggle status

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vikram Kumar**
- GitHub: [@vikram-2101](https://github.com/vikram-2101)

## 🙏 Acknowledgments

- Design inspiration from modern SaaS dashboards
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)

## 📞 Support

For support, email vikram@example.com or create an issue in the repository.

---

**Built with ❤️ for modern healthcare administration**
