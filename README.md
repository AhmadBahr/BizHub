<div align="center">

# BizHub CRM

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Modern, full‑stack CRM for SMBs built with React + TypeScript frontend and NestJS + Prisma backend.

</div>

## 🚀 Features

### Frontend (React + TypeScript)
- **📊 Dashboard Overview** – KPIs, charts, recent activities
- **👥 Contacts, Leads & Deals** – CRUD, advanced filters, Kanban for deals
- **✅ Tasks & Calendar** – Task management with due dates
- **🔔 Real‑time Notifications** – WebSocket updates with read/unread
- **📈 Analytics** – Conversion, revenue, productivity
- **📦 Export/Import** – CSV/XLSX with validation
- **📄 PDF Generation** – jsPDF + html2canvas
- **📱 Responsive UI** – Mobile‑first, modern UX

### Backend (NestJS)
- **🏗️ RESTful API** with modular architecture
- **🔒 AuthN/Z** – JWT, refresh tokens, RBAC
- **🗄️ Database** – PostgreSQL with Prisma
- **🛡️ Security** – Validation, CORS, throttling
- **📝 API Docs** – Swagger/OpenAPI at `/api`
- **🧪 Testing** – Unit and e2e
- **🌐 Realtime** – Socket.IO notifications

## 🛠️ Tech Stack

### Frontend
- React 19, TypeScript 5, Vite 7
- Redux Toolkit 2, React Router 7
- React Hook Form 7 + Zod 4
- Recharts 3, Heroicons, Socket.IO Client

### Backend
- NestJS 10, TypeScript 5, Node 18+
- Prisma ORM, PostgreSQL
- JWT, Passport, Class‑Validator
- Socket.IO, Swagger

## 📁 Project Structure

```
BizHub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── store/          # Redux Toolkit slices
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # NestJS backend
│   ├── src/
│   ├── prisma/             # Prisma schema and seed
│   └── package.json
├── docs/                   # Full documentation
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Update DATABASE_URL and other settings
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

### Frontend Setup
```bash
cd client
npm install
# Optional: cp .env.example .env and set VITE_API_URL
npm run dev
```

## 🔐 Authentication

- Access token in memory/localStorage for API requests
- Refresh token in HTTP‑only cookie
- Axios interceptors handle refresh
- Role‑based access: Admin, Manager, User

### Demo Credentials
- Email: `admin@bizhub.com`
- Password: `password123`

## 📊 Available Scripts

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (server/)
```bash
npm run start        # Start production server
npm run start:dev    # Start dev server with HMR
npm run build        # Build the application
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run db:generate  # Prisma generate
npm run db:push      # Apply schema to DB
npm run db:seed      # Seed database
```

## 🌐 API Endpoints (high level)

### Authentication
- `POST /auth/login` – Login
- `POST /auth/refresh` – Refresh access token
- `POST /auth/logout` – Logout

### Users
- `GET /users` – List users
- `GET /users/:id` – Get user
- `PUT /users/:id` – Update user
- `DELETE /users/:id` – Delete user

### Contacts
- `GET /contacts` – List contacts
- `GET /contacts/:id` – Get contact
- `POST /contacts` – Create
- `PUT /contacts/:id` – Update
- `DELETE /contacts/:id` – Delete

### Leads & Deals
- `GET /leads` / `GET /deals`
- `POST /leads` / `POST /deals`
- `PUT /leads/:id` / `PUT /deals/:id`

API docs available at `http://localhost:3000/api` when backend is running.

## 🎨 Customization

- Component‑scoped CSS, responsive design
- Theming via CSS variables
- To add modules: create slice in `store/slices/`, page in `pages/`, components in `components/`, update routes in `App.tsx`, and navigation in `Sidebar.tsx`.

## 🧪 Testing

```bash
# Frontend
cd client && npm run test

# Backend
cd server && npm run test && npm run test:e2e && npm run test:cov
```

## 🚀 Deployment

### Frontend
```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting
```

### Backend
```bash
cd server
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d

```

## 📝 License
MIT © BizHub contributors — see [LICENSE](LICENSE).
