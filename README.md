# BizHub CRM

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A modern, full-stack CRM solution built with React + TypeScript frontend and NestJS backend, designed for small-to-medium sized businesses.

## 🚀 Features

### Frontend (React + TypeScript)
- **📊 Dashboard Overview** - Key metrics, charts, and recent activities
- **👥 Contacts Management** - Full CRUD operations with search and filtering
- **🎯 Leads & Deals** - Kanban board and lead scoring system
- **✅ Tasks & Calendar** - Task management with due dates
- **📈 Analytics** - Conversion rates, revenue trends, and productivity metrics
- **🔗 Integrations** - Payment gateway, e-commerce, and marketing tools
- **🔐 Authentication** - JWT-based auth with role-based access control
- **📱 Responsive Design** - Mobile-first approach with modern UI/UX

### Backend (NestJS)
- **🏗️ RESTful API** - Clean, scalable architecture
- **🔒 Authentication & Authorization** - JWT tokens with session cookies
- **🗄️ Database Integration** - PostgreSQL with TypeORM
- **🛡️ Security** - Input validation, CORS, rate limiting
- **📝 API Documentation** - Swagger/OpenAPI integration
- **🧪 Testing** - Unit and integration tests
- **📦 Docker Support** - Containerized deployment

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://reactjs.org/) | 18.x | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type Safety |
| [Vite](https://vitejs.dev/) | 7.x | Build Tool |
| [Redux Toolkit](https://redux-toolkit.js.org/) | 2.x | State Management |
| [React Router](https://reactrouter.com/) | 6.x | Routing |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Form Handling |
| [Zod](https://zod.dev/) | 3.x | Schema Validation |
| [Recharts](https://recharts.org/) | 2.x | Chart Library |
| [Axios](https://axios-http.com/) | 1.x | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [NestJS](https://nestjs.com/) | 10.x | Backend Framework |
| [Node.js](https://nodejs.org/) | 18.x | Runtime Environment |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type Safety |
| [PostgreSQL](https://www.postgresql.org/) | 15.x | Database |
| [TypeORM](https://typeorm.io/) | 0.3.x | ORM |
| [JWT](https://jwt.io/) | - | Authentication |
| [Passport](https://www.passportjs.org/) | - | Auth Strategy |
| [Class Validator](https://github.com/typestack/class-validator) | 0.14.x | Validation |

## 📁 Project Structure

```
BizHub/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── store/        # Redux Toolkit slices
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript interfaces
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── server/                # NestJS Backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── contacts/     # Contacts module
│   │   ├── leads/        # Leads module
│   │   ├── deals/        # Deals module
│   │   ├── tasks/        # Tasks module
│   │   └── common/       # Shared utilities
│   ├── test/             # Test files
│   └── package.json      # Backend dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher)

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_APP_TITLE=BizHub CRM
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=bizhub_crm
   JWT_SECRET=your_jwt_secret
   SESSION_COOKIE_SECRET=your_session_secret
   ```

4. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

## 🔐 Authentication

The application uses JWT tokens for authentication with automatic refresh via HTTP session cookies:

- **Access Token**: Stored in memory (localStorage) for API requests
- **Refresh Token**: Stored in HTTP-only cookies for security
- **Automatic Refresh**: Axios interceptors handle token refresh automatically
- **Role-Based Access**: Admin, Manager, and User roles with different permissions

### Demo Credentials
- **Email**: `admin@bizhub.com`
- **Password**: `password123`

## 📊 Available Scripts

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Backend (server/)
```bash
npm run start        # Start production server
npm run start:dev    # Start development server with hot reload
npm run build        # Build the application
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run migration:run # Run database migrations
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Contacts
- `GET /contacts` - Get all contacts
- `GET /contacts/:id` - Get contact by ID
- `POST /contacts` - Create new contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

### Leads & Deals
- `GET /leads` - Get all leads
- `GET /deals` - Get all deals
- `POST /leads` - Create new lead
- `POST /deals` - Create new deal
- `PUT /leads/:id` - Update lead
- `PUT /deals/:id` - Update deal

## 🎨 Customization

### Styling
- Each component has its own CSS file for maintainability
- CSS variables for consistent theming
- Responsive design with mobile-first approach
- Easy to customize colors, fonts, and spacing

### Adding New Modules
1. Create new Redux slice in `store/slices/`
2. Add new page component in `pages/`
3. Create necessary components in `components/`
4. Update routing in `App.tsx`
5. Add navigation links in `Sidebar.tsx`

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test         # Run unit tests
npm run test:coverage # Run tests with coverage
```

### Backend Testing
```bash
cd server
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm run build
npm run start:prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [React](https://reactjs.org/) team for the amazing frontend framework
- [NestJS](https://nestjs.com/) team for the robust backend framework
- [Vite](https://vitejs.dev/) team for the fast build tool
- [Redux Toolkit](https://redux-toolkit.js.org/) team for state management
- [Recharts](https://recharts.org/) team for the chart library

---

**Made with ❤️ by the BizHub Team**
