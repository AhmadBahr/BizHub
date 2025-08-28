<div align="center">

# BizHub CRM

[![CI](https://img.shields.io/github/actions/workflow/status/your-org/bizhub/ci.yml?label=CI&logo=github)](https://github.com/your-org/bizhub/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10%2B-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

Modern, full‑stack CRM built with React + NestJS + Prisma.

## Quick start

```bash
# Backend
cd server && npm install && cp .env.example .env && npm run db:generate && npm run db:push && npm run db:seed && npm run start:dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

## Features at a glance
- Real‑time notifications (WebSocket)
- Contacts, Leads, Deals, Tasks
- Advanced search & filters, bulk actions
- File uploads, export/import CSV/XLSX
- PDF generation, analytics dashboards

## Docs
- Full documentation: `docs/README_FULL.md`
- Frontend README: `client/README.md`
- API Docs (when backend running): `http://localhost:3000/api`

## License
MIT © BizHub contributors
