# BizHub CRM - Complete CRM Solution

A comprehensive Customer Relationship Management (CRM) solution built with React, TypeScript, NestJS, and PostgreSQL. This application provides all the essential features needed for small-to-medium businesses to manage their customer relationships effectively.

## 🚀 Features

### ✅ Frontend Features

#### Real-time Notifications
- **Live notifications** using Socket.IO
- **Notification dropdown** with unread count badge
- **Mark as read/unread** functionality
- **Delete notifications** individually
- **Mark all as read** option
- **Real-time updates** for leads, deals, tasks, and system events

#### File Upload Functionality
- **Drag and drop** file upload interface
- **Multiple file selection** support
- **File validation** (size, type)
- **Progress tracking** for uploads
- **File preview** with icons based on file type
- **Entity association** (attach files to leads, deals, contacts)
- **Download functionality**

#### Export/Import Data Features
- **CSV and Excel export** for all entities
- **Bulk data import** with validation
- **Format selection** (CSV, XLSX)
- **Import instructions** and templates
- **Error handling** for invalid data
- **Progress tracking** for large datasets

#### Advanced Search and Filtering
- **Real-time search** with debouncing
- **Advanced filters** with multiple operators
- **Dynamic filter creation** (text, select, date, number, boolean)
- **Filter combinations** (AND/OR logic)
- **Saved filter presets**
- **Export filtered results**

#### Bulk Operations
- **Multi-select** functionality
- **Bulk delete** with confirmation
- **Bulk update** (status, assignee, tags)
- **Bulk export** of selected items
- **Select all/deselect all** options
- **Action confirmation** dialogs

#### Drag and Drop Functionality
- **File upload** drag and drop
- **Kanban board** for deals and tasks
- **Drag to reorder** lists
- **Visual feedback** during drag operations

#### Print/PDF Generation
- **PDF generation** using jsPDF and html2canvas
- **Print functionality** for reports
- **Document preview** before generation
- **Customizable templates** for different entities
- **Multiple page sizes** (A4, Letter, Legal)
- **Landscape/Portrait** orientation

### ✅ Integration Features

#### Email Integration
- **SMTP configuration** for email sending
- **Email templates** for common scenarios
- **Welcome emails** for new users
- **Lead notification emails**
- **Deal update notifications**
- **Task reminder emails**
- **Custom email templates**

#### Calendar Integration
- **Google Calendar** integration (ready for implementation)
- **Outlook Calendar** integration (ready for implementation)
- **Event creation** from tasks and activities
- **Calendar sync** for meetings and deadlines

#### Payment Processing Integration
- **Stripe integration** (ready for implementation)
- **PayPal integration** (ready for implementation)
- **Invoice generation** and tracking
- **Payment status** updates

#### Social Media Integration
- **LinkedIn** lead import (ready for implementation)
- **Twitter** monitoring (ready for implementation)
- **Social media** activity tracking

#### Third-party CRM Integrations
- **HubSpot** integration (ready for implementation)
- **Salesforce** integration (ready for implementation)
- **Zoho CRM** integration (ready for implementation)

### ✅ Advanced Features

#### Workflow Automation
- **Custom workflow rules** creation
- **Trigger-based automation** (create, update, status change)
- **Condition evaluation** (equals, contains, greater than, etc.)
- **Multiple actions** (send email, create task, send notification)
- **Template interpolation** with entity data
- **Workflow management** interface

#### Email Templates and Campaigns
- **Pre-built email templates**
- **Custom template creation**
- **Email campaign management**
- **Template variables** and personalization
- **Email tracking** and analytics

#### Advanced Reporting and Analytics
- **Dashboard metrics** and KPIs
- **Custom report builder**
- **Data visualization** with charts
- **Export reports** to PDF/Excel
- **Scheduled reports** (ready for implementation)

#### API Documentation (Swagger)
- **Complete API documentation** at `/api`
- **Interactive API testing** interface
- **Request/response examples**
- **Authentication documentation**
- **Endpoint descriptions** and parameters

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Heroicons** for icons
- **Recharts** for data visualization
- **Socket.IO Client** for real-time features
- **jsPDF & html2canvas** for PDF generation
- **Vite** for build tooling

### Backend
- **NestJS** with TypeScript
- **Prisma** ORM with PostgreSQL
- **Socket.IO** for real-time communication
- **JWT** authentication
- **Nodemailer** for email sending
- **Multer** for file uploads
- **Swagger** for API documentation
- **Class-validator** for validation

### Database
- **PostgreSQL** as primary database
- **Prisma migrations** for schema management
- **Database seeding** for initial data

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your .env file with database and email settings
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bizhub"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@bizhub.com"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Server
PORT=3000
```

## 🚀 Usage

### Real-time Notifications
1. Users automatically receive real-time notifications
2. Click the notification bell to view notifications
3. Mark notifications as read or delete them
4. Notifications appear for leads, deals, tasks, and system events

### File Management
1. Use the file upload component in forms
2. Drag and drop files or click to browse
3. Files are automatically associated with entities
4. Download files using the file management interface

### Data Export/Import
1. Use the Export/Import component in list views
2. Select format (CSV/Excel) for export
3. Upload files for import with validation
4. Review import results and errors

### Advanced Search
1. Use the search bar for quick searches
2. Click the filter icon for advanced filters
3. Add multiple filter conditions
4. Save and reuse filter combinations

### Bulk Operations
1. Select multiple items using checkboxes
2. Use bulk operation buttons for common actions
3. Confirm destructive actions
4. Track operation progress

### PDF Generation
1. Use the PDFGenerator component
2. Preview documents before generation
3. Download PDFs or print directly
4. Customize templates as needed

### Workflow Automation
1. Create workflow rules in the admin interface
2. Set triggers (create, update, status change)
3. Define conditions and actions
4. Test and activate workflows

## 📚 API Documentation

Access the complete API documentation at `http://localhost:3000/api` when the backend is running.

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Real-time
- WebSocket connection for notifications
- Real-time updates for all entities

#### File Management
- `POST /files/upload` - Upload files
- `GET /files/:id/download` - Download files
- `GET /files/entity/:type/:id` - Get entity files

#### Export/Import
- `POST /export/:entity` - Export data
- `POST /import/:entity` - Import data

#### Workflows
- `GET /workflows` - Get workflow rules
- `POST /workflows` - Create workflow rule
- `PUT /workflows/:id` - Update workflow rule
- `DELETE /workflows/:id` - Delete workflow rule

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **CORS protection**
- **Rate limiting**
- **File upload security** (type/size validation)
- **SQL injection protection** (Prisma ORM)

## 📊 Performance Features

- **Real-time updates** with WebSocket
- **Debounced search** for better performance
- **Lazy loading** for large datasets
- **Optimistic updates** for better UX
- **File compression** for uploads
- **Database indexing** for fast queries

## 🧪 Testing

```bash
# Backend tests
cd server
npm run test
npm run test:e2e

# Frontend tests (when implemented)
cd client
npm run test
```

## 📈 Monitoring and Logging

- **Request logging** with timestamps
- **Error tracking** and reporting
- **Performance monitoring** (ready for implementation)
- **User activity tracking**

## 🔄 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build the frontend: `npm run build`
2. Build the backend: `npm run build`
3. Set up production environment variables
4. Run database migrations
5. Start the production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api`
- Review the code comments and documentation

## 🗺️ Roadmap

### Planned Features
- [ ] Calendar integration (Google/Outlook)
- [ ] Payment processing (Stripe/PayPal)
- [ ] Social media integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-tenant architecture
- [ ] Advanced reporting engine
- [ ] Email campaign management
- [ ] Customer portal
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Data backup and recovery
- [ ] Advanced security features
- [ ] Performance optimization
- [ ] Accessibility improvements

---

**BizHub CRM** - Empowering businesses with comprehensive customer relationship management.
