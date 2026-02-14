# OxyHealth.ai - Admin Portal

A premium enterprise-grade admin portal for managing digital health system configurations.

## 🚀 Features

- **Authentication**: JWT-based secure authentication
- **Dashboard**: Real-time statistics with KPI cards
- **Customer Management**: Full CRUD operations for customer accounts
- **Institution Management**: Manage healthcare institutions
- **User Management**: Role-based user management (Doctor, Health Worker, Coordinator)
- **Panel Management**: Create and manage user panels
- **Premium UI**: Glassmorphism effects, smooth animations, and modern design

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- ES Modules
- RESTful API architecture

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Framer Motion for animations
- Axios for API calls
- React Router for navigation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/oxyhealth
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Login Credentials

- **Email**: admin@oxyhealth.ai
- **Password**: admin123

## 📁 Project Structure

```
oxyhealth.ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error middleware
│   │   └── server.js        # Express server
│   ├── seed.js              # Database seeding script
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── layout/      # Layout components
    │   │   └── ui/          # UI components
    │   ├── context/         # React contexts
    │   ├── services/        # API services
    │   ├── pages/           # Page components
    │   ├── hooks/           # Custom hooks
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    └── package.json
```

## 🎨 Design System

- **Colors**: Slate for backgrounds, Blue for primary actions
- **Typography**: Inter font family
- **Spacing**: 8px grid system
- **Shadows**: Premium shadow utilities
- **Effects**: Glassmorphism on sidebar and modals

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Customers
- `GET /api/customers` - Get all customers (with pagination)
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `PATCH /api/customers/:id/status` - Toggle status

### Institutions
- `GET /api/institutions` - Get all institutions
- `POST /api/institutions` - Create institution
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution
- `PATCH /api/institutions/:id/status` - Toggle status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/status` - Toggle status

### Panels
- `GET /api/panels` - Get all panels
- `POST /api/panels` - Create panel
- `PUT /api/panels/:id` - Update panel
- `DELETE /api/panels/:id` - Delete panel
- `PATCH /api/panels/:id/status` - Toggle status

### Stats
- `GET /api/stats/dashboard` - Get dashboard statistics

## 📝 License

MIT
