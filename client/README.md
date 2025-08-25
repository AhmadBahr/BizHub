# BizHub CRM Frontend

A modern, responsive CRM dashboard built with React, TypeScript, and Redux Toolkit.

## Features

- **Authentication**: JWT-based login with automatic token refresh
- **Dashboard**: Key metrics, charts, and recent activities
- **Contacts Management**: Full CRUD operations with search and filters
- **Leads & Deals**: Pipeline management and tracking
- **Tasks**: Task management with priorities and due dates
- **Analytics**: Charts and business insights
- **Responsive Design**: Mobile-first approach with modern UI

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **React Hook Form** with Zod validation
- **Axios** for API communication
- **Recharts** for data visualization
- **Heroicons** for icons
- **Vanilla CSS** with CSS variables

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your API endpoint in `.env`:
```
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/          # Authentication components
│   ├── Charts/        # Chart components
│   ├── Contacts/      # Contact management components
│   ├── Dashboard/     # Dashboard components
│   └── Layout/        # Layout and navigation
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API services
├── store/             # Redux store and slices
├── types/             # TypeScript interfaces
└── utils/             # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## API Integration

The frontend is designed to work with the BizHub NestJS backend. Key API endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user
- `GET /contacts` - Fetch contacts
- `GET /leads` - Fetch leads
- `GET /deals` - Fetch deals
- `GET /tasks` - Fetch tasks
- `GET /dashboard/*` - Dashboard data

## State Management

Redux Toolkit is used for state management with the following slices:

- **auth**: User authentication and session
- **contacts**: Contact management
- **leads**: Lead tracking
- **deals**: Deal pipeline
- **dashboard**: Dashboard metrics and data
- **tasks**: Task management

## Styling

The application uses vanilla CSS with CSS variables for theming:

- Consistent spacing and typography
- Responsive design with mobile-first approach
- CSS variables for colors, shadows, and borders
- Utility classes for common patterns

## Authentication Flow

1. User enters credentials on login page
2. JWT access token stored in localStorage
3. HTTP-only session cookies handle token refresh
4. Axios interceptors automatically attach tokens to requests
5. 401 responses trigger automatic token refresh
6. Failed refresh redirects to login

## Development

### Adding New Components

1. Create component file in appropriate directory
2. Create corresponding CSS file
3. Export component from index file
4. Add to relevant page or parent component

### Adding New Pages

1. Create page component in `src/pages/`
2. Create corresponding CSS file
3. Add route to `App.tsx`
4. Add navigation item to sidebar

### API Integration

1. Add new API methods to `src/services/api.ts`
2. Create Redux slice for new domain
3. Add async thunks for API calls
4. Use in components with `useAppDispatch` and `useAppSelector`

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

- `VITE_API_URL`: Backend API endpoint
- `VITE_APP_TITLE`: Application title

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain consistent CSS naming conventions
4. Add proper error handling and loading states
5. Test responsive design on multiple screen sizes

## License

This project is part of the BizHub CRM system.
